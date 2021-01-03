import * as express from 'express'
import { Pool, PoolConfig } from 'pg'

type CustomPoolConfig = PoolConfig & { url: string }

const pool = new Pool({
  user: "<USER>",
  host: "<HOST>",
  database: "<DATABASE>",
  password: "<PASSWORD>",
  port: 5432,
  url: "<URL>"
} as CustomPoolConfig)

function giveResponse(
  response: express.Response,
  status: 'success' | 'created' | 'bad_request' | 'not_found',
  data: any,
  info?: string
) {
  let statusCode: number

  if(status == 'success') {
    statusCode = 200
  } else if(status == 'created') {
    statusCode = 201
  } else if(status == 'bad_request') {
    statusCode = 400
  } else if(status == 'not_found') {
    statusCode = 404
  }

  response.status(statusCode!).json({
    status,
    info,
    data
  })
}

 const login = (req: express.Request, res: express.Response) => {
  const { username, password } = req.fields
  
  pool.query(
    `SELECT * FROM users WHERE username = $1`,
    [username],
    (err, results) => {
      if(err) {
        giveResponse(res, 'bad_request', {}, `${err.name} : ${err.message}`)
      } else {
        if(results.rows.length > 0) {
          if(password == results.rows[0].password) {
            const data = {
              ...results.rows[0],
              password: undefined
            }
  
            giveResponse(res, 'success', data, 'Berhasil login')
          } else {
            giveResponse(res, 'bad_request', {}, 'Password salah')
          }
        } else {
          giveResponse(res, 'not_found', {}, 'Tidak ditemukan akun dengan username tersebut')
        }
      }
    }
  )
}

 const register = (req: express.Request, res: express.Response) => {
  type RegisterEndpointFields = {
    username: string,
    password: string
  }

  const { username, password } = req.fields as RegisterEndpointFields

  if (/\s/.test(username)) {
    giveResponse(res, 'bad_request', {}, 'Gagal register akun, username tidak boleh berisi spasi')
  } else {
    pool.query(
      `INSERT INTO users (username, password) VALUES ($1, $2)`,
      [username, password],
      (err, results) => {
        if(err) {
          giveResponse(res, 'bad_request', {}, `${err.name} : ${err.message}`)
        } else {
          pool.query(
            `SELECT * FROM users WHERE username = $1`,
            [username],
            (err, results) => {
              const data = {
                ...results.rows[results.rows.length - 1],
                password: undefined
              }
  
              giveResponse(res, 'created', data, 'Berhasil register akun')
            }
          )
        }
      }
    )
  }
}

 const deleteUser = (req: express.Request, res: express.Response) => {
  const { username, password } = req.fields

  pool.query(
    `SELECT * FROM users WHERE username = $1`,
    [username],
    (err, results) => {
      if(err) {
        giveResponse(res, 'bad_request', {}, `${err.name} : ${err.message}`)
      } else {
        if(results.rows.length > 0) {
          const data = results.rows[0]

          if(password == data.password) {
            pool.query(
              'DELETE FROM notes WHERE owner_id = $1',
              [data.id],
              (err, results) => {
                if(err) {
                  giveResponse(res, 'bad_request', {}, `${err.name} : ${err.message}`)
                } else {
                  pool.query(
                    'DELETE FROM users WHERE id = $1',
                    [data.id],
                    (err, results) => {
                      if(err) {
                        giveResponse(res, 'bad_request', {}, `${err.name} : ${err.message}`)
                      } else {
                        giveResponse(res, 'success', {}, `Berhasil menghapus akun dengan username ${username}`)
                      }
                    }
                  )
                }
              }
            )
          } else {
            giveResponse(res, 'bad_request', {}, 'Password salah')
          }
        } else {
          giveResponse(res, 'not_found', {}, 'Tidak ditemukan akun dengan username tersebut')
        }
      }
    }
  )
}

const createNote = (req: express.Request, res: express.Response) => {
  const { owner_id, note } = req.fields

  pool.query(
    `SELECT * FROM users WHERE id = $1`,
    [owner_id],
    (err, results) => {
      if(err) {
        giveResponse(res, 'bad_request', {}, `${err.name} : ${err.message}`)
      } else {
        if(results.rows.length > 0) {
          pool.query(
            'INSERT INTO notes (owner_id, note) VALUES ($1, $2)',
            [owner_id, note],
            (err, results) => {
              if(err) {
                giveResponse(res, 'bad_request', {}, `${err.name} : ${err.message}`)
              } else {
                pool.query(
                  `SELECT * FROM notes WHERE owner_id = $1`,
                  [owner_id],
                  (err, results) => {
                    if(err) {
                      giveResponse(res, 'bad_request', {}, `${err.name} : ${err.message}`)
                    } else {
                      const data = results.rows[results.rows.length - 1]

                      giveResponse(res, 'success', data, 'Berhasil membuat catatan baru')
                    }
                  }
                )
              }
            }
          )
        } else {
          giveResponse(res, 'not_found', {}, 'Tidak ditemukan akun dengan id tersebut')
        }
      }
    }
  )
}

const getNotes = (req: express.Request, res: express.Response) => {
  const { owner_id } = req.query

  if(owner_id == undefined) {
    giveResponse(res, 'bad_request', [], 'Query owner_id required')
  } else {
    pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [owner_id],
      (err, results) => {
        if(err) {
          giveResponse(res, 'bad_request', [], `${err.name} : ${err.message}`)
        } else {
          if(results.rows.length > 0) {
            pool.query(
              'SELECT * FROM notes WHERE owner_id = $1',
              [owner_id],
              (err, results) => {
                if(err) {
                  giveResponse(res, 'bad_request', [], `${err.name} : ${err.message}`)
                } else {
                  const data = results.rows
          
                  giveResponse(res, 'success', data, 'Berhasil mendapatkan data catatan')
                }
              }
            )
          } else {
            giveResponse(res, 'not_found', [], 'Tidak ditemukan akun dengan id tersebut')
          }
        }
      }
    )
  }
}

const editNote = (req: express.Request, res: express.Response) => {
  const { owner_id, id, new_note } = req.fields

  pool.query(
    `SELECT * FROM users WHERE id = $1`,
    [owner_id],
    (err, results) => {
      if(err) {
        giveResponse(res, 'bad_request', {}, `${err.name} : ${err.message}`)
      } else {
        if(results.rows.length > 0) {
          pool.query(
            'SELECT * FROM notes WHERE id = $1',
            [id],
            (err, results) => {
              if(err) {
                giveResponse(res, 'bad_request', {}, `${err.name} : ${err.message}`)
              } else {
                if(results.rows.length > 0) {
                  const pickedNote = results.rows[0]

                  if(owner_id == pickedNote.owner_id) {
                    pool.query(
                      'UPDATE notes SET note = $2 WHERE id = $1',
                      [id, new_note],
                      (err, results) => {
                        if(err) {
                          giveResponse(res, 'bad_request', {}, `${err.name} : ${err.message}`)
                        } else {
                          pool.query(
                            'SELECT * FROM notes WHERE id = $1',
                            [id],
                            (err, results) => {
                              if(err) {
                                giveResponse(res, 'bad_request', {}, `${err.name} : ${err.message}`)
                              } else {
                                const data = results.rows[0]
                                giveResponse(res, 'success', data, 'Berhasil mengedit catatan')
                              }
                            }
                          )
                        }
                      }
                    )
                  } else {
                    giveResponse(res, 'bad_request', {}, 'Gagal mengedit catatan, karena owner_id yang diberikan tidak sesuai dengan owner_id catatan')
                  }
                } else {
                  giveResponse(res, 'not_found', {}, 'Tidak ditemukan catatan dengan id tersebut')
                }
              }
            }
          )
        } else {
          giveResponse(res, 'not_found', {}, 'Tidak ditemukan akun dengan id tersebut')
        }
      }
    }
  )
}

const deleteNote = (req: express.Request, res: express.Response) => {
  const { owner_id, id } = req.fields

  pool.query(
    `SELECT * FROM users WHERE id = $1`,
    [owner_id],
    (err, results) => {
      if(err) {
        giveResponse(res, 'bad_request', {}, `${err.name} : ${err.message}`)
      } else {
        if(results.rows.length > 0) {
          pool.query(
            'SELECT * FROM notes WHERE id = $1',
            [id],
            (err, results) => {
              if(err) {
                giveResponse(res, 'bad_request', {}, `${err.name} : ${err.message}`)
              } else {
                if(results.rows.length > 0) {
                  const data = results.rows[0]

                  if(owner_id == data.owner_id) {
                    pool.query(
                      'DELETE FROM notes WHERE id = $1',
                      [id],
                      (err, results) => {
                        if(err) {
                          giveResponse(res, 'bad_request', {}, `${err.name} : ${err.message}`)
                        } else {
                          giveResponse(res, 'success', {}, 'Berhasil menghapus catatan')
                        }
                      }
                    )
                  } else {
                    giveResponse(res, 'bad_request', {}, 'Gagal menghapus catatan, karena owner_id yang diberikan tidak sesuai dengan owner_id catatan')
                  }
                } else {
                  giveResponse(res, 'not_found', {}, 'Tidak ditemukan catatan dengan id tersebut')
                }
              }
            }
          )
        } else {
          giveResponse(res, 'not_found', {}, 'Tidak ditemukan akun dengan id tersebut')
        }
      }
    }
  )
}

const deleteAllNotes = (req: express.Request, res: express.Response) => {
  const { owner_id } = req.fields

  pool.query(
    `SELECT * FROM users WHERE id = $1`,
    [owner_id],
    (err, results) => {
      if(err) {
        giveResponse(res, 'bad_request', {}, `${err.name} : ${err.message}`)
      } else {
        if(results.rows.length > 0) {
          pool.query(
            'DELETE FROM notes WHERE owner_id = $1',
            [owner_id],
            (err, results) => {
              if(err) {
                giveResponse(res, 'bad_request', {}, `${err.name} : ${err.message}`)
              } else {
                giveResponse(res, 'success', {}, 'Berhasil menghapus semua catatan user ini')
              }
            }
          )
        } else {
          giveResponse(res, 'not_found', {}, 'Tidak ditemukan akun dengan id tersebut')
        }
      }
    }
  )
}

export default {
  login,
  register,
  deleteUser,
  createNote,
  getNotes,
  editNote,
  deleteNote,
  deleteAllNotes
}