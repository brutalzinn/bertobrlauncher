import { readFileSync, writeFileSync, existsSync } from "node:fs"

class Storage {

    static exists(filePath: string) {
        return existsSync(filePath);
    }

    static readJsonFile(filePath: string): string[] | null {
        try {
            const data = readFileSync(filePath, 'utf8');
            const jsonArray = JSON.parse(data);
            return jsonArray;
            // if (Array.isArray(jsonArray) && jsonArray.every(item => typeof item === 'string')) {
            //     return jsonArray;
            // } else {
            //     throw new Error('The file does not contain a valid JSON array of strings.');
            // }
        } catch (err) {
            console.error('Error reading JSON file:', err);
            return null;
        }
    }

    static writeJsonFile(filePath: string, jsonArray: string[]) {
        // if (Array.isArray(jsonArray) && jsonArray.every(item => typeof item === 'string')) {
        const jsonString = JSON.stringify(jsonArray, null, 2);
        try {
            writeFileSync(filePath, jsonString, 'utf8');
            console.log('File successfully written!');
        } catch (err) {
            console.error('Error writing JSON file:', err);
        }
        // } else {
        //     console.error('Invalid data: Not an array of strings.');
        // }
    }
}

export {
    Storage
}