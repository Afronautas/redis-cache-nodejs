import DataStore from '@seald-io/nedb'

export const db = new DataStore({ filename: 'data.db', autoload: true })