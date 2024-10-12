import { hello, goodbye } from "utils";
import { steamAchievementManager } from "./achievement";

function main(debug = false): void {
	if (debug) {
		console.log("todo: debug mode");
		hello("world");
		goodbye("world");
		return;
	}
	const defaultConfig = {
		databaseType: Bun.env.DB_DEFAULT_USE || "nocodb",
		gameName: Bun.env.GAME_NAME || "",
		tableName: Bun.env.GAME_TABLE || "",
	};
	// console.debug(Bun.env.ACTION);
	const [, , firstArgv, ...otherArgs] = Bun.argv;
	let [gameName, tableName, databaseType] = otherArgs;
	gameName = (gameName || defaultConfig.gameName).toLowerCase();
	tableName = (tableName || defaultConfig.tableName).toLowerCase();
	databaseType = (databaseType || defaultConfig.databaseType).toLowerCase();
	switch (firstArgv) {
		case "u":
		case "--upload": {
			// steamAchievementManager.upload(gameName, tableName, databaseType);
			break;
		}

		case "d":
		case "--download": {
			// steamAchievementManager.download(gameName, tableName, databaseType);
			break;
		}

		default: {
			console.error("Missing parameters, run mode not specified");
			break;
		}
	}
}

main([undefined, "development"].includes(Bun.env.NODE_ENV));
