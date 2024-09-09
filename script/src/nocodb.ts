/**
 * @descption 由于无法获取长期有效的 Auth Token，因此使用 API Token + 手动指定 tableId 映射
 * @link https://docs.nocodb.com/0.109.7/faqs/#what-is-the-difference-between-auth-token-and-api-token-
 * @link https://docs.nocodb.com/0.109.7/developer-resources/accessing-apis
 * @link https://docs.nocodb.com/account-settings/api-tokens/
 */
// @ts-ignore
import DatabaseMeta from "./nocodb_meta.toml"; // Bun 原生支持导入 TOML

class NocodbClient {
	protected readonly url: string | undefined = Bun.env.NOCODB_URL;
	// 私有属性采用 ECMAScript 特性而不是 private 关键字
	readonly #token: string = Bun.env.NOCODB_TOKEN || "";

	constructor() {
		if (!this.url || this.#token === "") {
			throw new Error("读取环境变量失败");
		}
	}

	async getTableRecords(
		gameName: string,
		tableName: string,
	): Promise<object[]> {
		const tableId = DatabaseMeta[gameName].tableIdMap[tableName];
		const response = await fetch(
			`${this.url}/api/v2/tables/${tableId}/records?limit=100&fields=`,
			{
				headers: { "xc-token": this.#token },
			},
		);
		if (response.status !== 200) {
			console.error(`查询 ${gameName} 的 ${tableName} 表失败`);
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
		const tableId = DatabaseMeta[gameName].tableIdMap[tableName];
		const currentRecordsResponse = await fetch(
			`${this.url}/api/v2/tables/${tableId}/records?fields=Id`,
			{
				headers: { "xc-token": this.#token },
			},
		);
		if (currentRecordsResponse.status !== 200) {
			console.error(`查询 ${gameName} 的 ${tableName} 表失败`);
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
			console.error(`清空 ${gameName} 的 ${tableName} 表失败`);
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
			console.error(`更新 ${gameName} 的 ${tableName} 表失败`);
			return false;
		}
		console.log(`更新 ${gameName} 的 ${tableName} 表成功`);
		return true;
	}

	async test(): Promise<void> {
		const result = await this.getTableRecords("black-myth-wukong", "精魄");
		console.table(result);
	}
}

export const nocodbClient = new NocodbClient();
