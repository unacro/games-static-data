import utils from "./utils";

/**
 * @descption 由于无法获取长期有效的 Auth Token，因此使用 API Token + 手动指定 tableId 映射
 * @link https://docs.nocodb.com/0.109.7/faqs/#what-is-the-difference-between-auth-token-and-api-token-
 * @link https://docs.nocodb.com/0.109.7/developer-resources/accessing-apis
 * @link https://docs.nocodb.com/account-settings/api-tokens/
 */
// @ts-ignore
import DatabaseMetaInfo from "../config/nocodb_meta_info.toml"; // Bun 原生支持导入 TOML

class NocodbClient {
	protected readonly url: string | undefined = Bun.env.DB_NOCODB_URL;
	// 私有属性采用 ECMAScript 特性而不是 private 关键字
	readonly #token: string = Bun.env.DB_NOCODB_TOKEN || "";

	constructor() {
		if (!this.url || this.#token === "") {
			throw new Error("[NocoDB] Read environment variables failed");
		}
	}

	getTableId(gameName: string, tableName: string): string {
		const [targetGameName, targetTableName]: string[] = [
			gameName,
			tableName,
		].map(utils.dehumanize);
		if (!(targetGameName in DatabaseMetaInfo)) {
			throw new Error(
				`[NocoDB] Meta information of "${targetGameName}" not configured yet`,
			);
		}
		const gameMetaInfo = DatabaseMetaInfo[targetGameName];
		if (
			!("tableIdMap" in gameMetaInfo) ||
			!(targetTableName in gameMetaInfo.tableIdMap)
		) {
			throw new Error(
				`[NocoDB] TableId ${targetTableName} of "${targetGameName}" not configured yet`,
			);
		}
		return gameMetaInfo.tableIdMap[targetTableName];
	}

	async getTableRecords(
		gameName: string,
		tableName: string,
	): Promise<object[]> {
		const tableId = this.getTableId(gameName, tableName);
		const response = await fetch(
			`${this.url}/api/v2/tables/${tableId}/records?limit=100&fields=`,
			{
				headers: { "xc-token": this.#token },
			},
		);
		if (response.status !== 200) {
			console.error(
				`[NocoDB] Query table ${tableName} of "${gameName}" failed`,
			);
			return [];
		}
		const tableContent = await response.json();
		const tableRecords = tableContent.list.map(
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			(record: { [key: string]: any }) => {
				Object.keys(record).map((key) => {
					if (["CreatedAt", "UpdatedAt"].includes(key)) {
						delete record[key];
					}
				});
				return record;
			},
		);
		return tableRecords;
	}

	async setTableRecords(
		gameName: string,
		tableName: string,
		records: object[],
	): Promise<boolean> {
		const tableId = this.getTableId(gameName, tableName);
		const currentRecordsResponse = await fetch(
			`${this.url}/api/v2/tables/${tableId}/records?fields=Id`,
			{
				headers: { "xc-token": this.#token },
			},
		);
		if (currentRecordsResponse.status !== 200) {
			console.error(
				`[NocoDB] Query table ${tableName} of "${gameName}" failed`,
			);
			return false;
		}
		const currentRecordsResult = await currentRecordsResponse.json();
		// const deletePayload = Array.from({ length }, (_, index) => index + 1).map((Id) => { return { Id } });
		const deleteResponse = await fetch(
			`${this.url}/api/v2/tables/${tableId}/records`,
			{
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					"xc-token": this.#token,
				},
				body: JSON.stringify(currentRecordsResult.list),
			},
		);
		if (deleteResponse.status !== 200) {
			console.error(
				`[NocoDB] Clear table ${tableName} of "${gameName}" failed`,
			);
			return false;
		}
		const updateResponse = await fetch(
			`${this.url}/api/v2/tables/${tableId}/records`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"xc-token": this.#token,
				},
				body: JSON.stringify(records),
			},
		);
		if (updateResponse.status !== 200) {
			console.error(
				`[NocoDB] Update table ${tableName} of "${gameName}" failed`,
			);
			return false;
		}
		console.log(
			`[NocoDB] Updated table ${tableName} of "${gameName}" successfully`,
		);
		return true;
	}

	async test(): Promise<void> {
		const result = await this.getTableRecords("Slay The Spire", "Cards");
		console.table(result);
	}
}

export const nocodbClient = new NocodbClient();
