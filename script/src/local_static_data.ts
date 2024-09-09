import fs from "node:fs";
import path from "node:path";
import utils from "./utils";

class LocalStaticDataManager {
	static getFilePath(
		gameName: string,
		gameProperty: string,
		fileExtension = "json",
	): string {
		return path.join(
			path.join(__dirname, "..", "..", "data", "games"), // script path: ./script/src/
			utils.formatTitle(gameName),
			`${utils.formatTitle(gameProperty)}.${fileExtension}`,
		);
	}

	// constructor() {}

	loadData(
		gameName: string,
		gameProperty: string,
		fileExtension = "json",
	): object[] {
		// @ts-ignore
		const filePath = this.constructor.getFilePath(
			gameName,
			gameProperty,
			fileExtension,
		);
		console.log(`loading data from "${filePath}"`);
		let gameData = undefined;
		try {
			const fileContent = fs.readFileSync(filePath, "utf-8");
			switch (fileExtension) {
				case "csv": {
					const csvTable = fileContent
						.replaceAll("\r", "")
						.split("\n")
						.filter((row) => row !== "")
						.map((row) => {
							return row.split(",");
						});
					const csvTableheader = csvTable.shift() as string[];
					gameData = csvTable.map((row) => {
						return utils.zipDictionary(csvTableheader, row);
					});
					break;
				}

				// json
				default: {
					gameData = JSON.parse(fileContent);
					break;
				}
			}
		} catch (err) {
			console.error("Error reading file:", err);
		}
		return typeof gameData === "object" && gameData !== null ? gameData : {};
	}

	saveData(
		gameData: object,
		gameName: string,
		gameProperty: string,
		fileExtension = "json",
	): boolean {
		try {
			fs.writeFileSync(
				// @ts-ignore
				this.constructor.getFilePath(gameName, gameProperty, fileExtension),
				JSON.stringify(gameData),
			);
			console.log(
				`[${gameName}] Saved game data to "${gameProperty}.${fileExtension}"`,
			);
			return true;
		} catch (err) {
			console.error("Error writing file:", err);
			return false;
		}
	}

	test(): void {
		const result = this.loadData("Slay The Spire", "cards");
		// const result = this.loadData("Black Myth: Wukong", "精魄", "csv");
		// console.log(result);
		console.table(result);
		// this.saveData(result, "Slay The Spire", "new-cards");
	}
}

export const localDataManager = new LocalStaticDataManager();
