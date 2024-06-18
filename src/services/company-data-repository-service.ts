import * as fs from 'fs';
import csvParser from 'csv-parser';

export type CSVData = Record<string, string | number>;

export class CompanyDataRepository {
    async getAllData(): Promise<CSVData[]> {
        const data: CSVData[] = [];

        return new Promise((resolve, reject) => {
            fs.createReadStream('data/database.csv')
                .pipe(csvParser())
                .on('data', (row: Record<string, string>) => {
                    data.push(row);
                })
                .on('end', () => {
                    resolve(data);
                })
                .on('error', (err: NodeJS.ErrnoException | null) => {
                    reject(err);
                });
        });
    }
}
