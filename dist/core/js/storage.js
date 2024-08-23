"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = void 0;
const node_fs_1 = require("node:fs");
class Storage {
    static exists(filePath) {
        return (0, node_fs_1.existsSync)(filePath);
    }
    static readJsonFile(filePath) {
        try {
            const data = (0, node_fs_1.readFileSync)(filePath, 'utf8');
            const jsonArray = JSON.parse(data);
            return jsonArray;
            // if (Array.isArray(jsonArray) && jsonArray.every(item => typeof item === 'string')) {
            //     return jsonArray;
            // } else {
            //     throw new Error('The file does not contain a valid JSON array of strings.');
            // }
        }
        catch (err) {
            console.error('Error reading JSON file:', err);
            return null;
        }
    }
    static writeJsonFile(filePath, jsonArray) {
        // if (Array.isArray(jsonArray) && jsonArray.every(item => typeof item === 'string')) {
        const jsonString = JSON.stringify(jsonArray, null, 2);
        try {
            (0, node_fs_1.writeFileSync)(filePath, jsonString, 'utf8');
            console.log('File successfully written!');
        }
        catch (err) {
            console.error('Error writing JSON file:', err);
        }
        // } else {
        //     console.error('Invalid data: Not an array of strings.');
        // }
    }
}
exports.Storage = Storage;
