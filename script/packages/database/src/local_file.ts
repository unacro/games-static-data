import fs from "node:fs";
import path from "node:path";
import utils from "./utils";

class LocalStaticDataManager {
	static getFilePath(
		gameName: string,
		tableName: string,
		fileExtension = "json",
		rootPath = path.join(__dirname, ...Array(4).fill(".."), "data", "games"),
	): string {
		return path.join(
			rootPath, // script path: ./script/packages/database/src/
			utils.dehumanize(gameName),
			`${utils.dehumanize(tableName)}.${fileExtension}`,
		);
	}

	// constructor() {}

	loadData(
		gameName: string,
		tableName: string,
		fileExtension = "json",
	): object[] {
		// @ts-ignore
		const filePath = this.constructor.getFilePath(
			gameName,
			tableName,
			fileExtension,
		);
		console.log(
			`[Local File] Loading "${gameName}" data from "${filePath}"...`,
		);
		let gameData = undefined;
		try {
			const fileContent = fs.readFileSync(filePath, "utf-8");
			switch (fileExtension) {
				case "csv": {
					const csvTable = fileContent
						.replaceAll("\r", "")
						.split("\n")
						.filter((row) => row !== "")
						.map((row) => row.split(","));
					const csvTableheader = csvTable.shift() as string[];
					gameData = csvTable.map((row) =>
						utils.zipDictionary(csvTableheader, row),
					);
					break;
				}

				// json
				default: {
					gameData = JSON.parse(fileContent);
					break;
				}
			}
		} catch (err) {
			console.error("[Local File] Error reading file:", err);
		}
		return typeof gameData === "object" && gameData !== null ? gameData : {};
	}

	saveData(
		gameData: object,
		gameName: string,
		tableName: string,
		fileExtension = "json",
	): boolean {
		// @ts-ignore
		const filePath = this.constructor.getFilePath(
			gameName,
			tableName,
			fileExtension,
		);
		if (!fs.existsSync(path.dirname(filePath))) {
			fs.mkdirSync(path.dirname(filePath), { recursive: true });
		}
		try {
			fs.writeFileSync(filePath, JSON.stringify(gameData, null, "\t"));
			console.log(`[Local File] Saved "${gameName}" data to "${filePath}"`);
			return true;
		} catch (err) {
			console.error("[Local File] Error writing file:", err);
			return false;
		}
	}

	test(): void {
		const result = this.loadData("Slay The Spire", "cards");
		// const result = this.loadData("Black Myth: Wukong", "spirits", "csv");
		// console.log(result);
		console.table(result);
		// this.saveData(result, "Slay The Spire", "new-cards");
	}
}

export const localDataManager = new LocalStaticDataManager();
