import * as express from 'express'
import * as formidable from 'express-formidable'

import db from './query-functions'

const app = express()
const port = process.env.PORT || 3000

app.use(formidable())

app.get('/', (request, response) => response.status(200).send({
    info: `Notes API | Express & PostgreSQL API using TypeScript`
}))

app.post('/login', db.login) //username, password
app.post('/register', db.register) //username, password
app.delete('/delete-user', db.deleteUser) //username, password
app.post('/create-note', db.createNote) //owner_id, note
app.get('/notes', db.getNotes) //owner_id
app.put('/edit-note', db.editNote) //owner_id, id, new_note
app.delete('/delete-note', db.deleteNote) //owner_id, id
app.delete('/delete-all-notes', db.deleteAllNotes) //owner_id

app.listen(port, () => console.log(`App running on port ${port}.`))