// Dépendances native
const path = require('path')

// Dépendances 3rd party
const express = require('express')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const sass = require('node-sass-middleware')
const db = require('sqlite')

// Constantes et initialisations
const PORT = process.PORT || 8080
const app = express()

// Mise en place des vues
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware pour forcer un verbe HTTP
app.use(methodOverride('_method', { methods: [ 'POST', 'GET' ] }))

// Middleware pour parser le body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Préprocesseur sur les fichiers scss -> css
app.use(sass({
  src: path.join(__dirname, 'styles'),
  dest: path.join(__dirname, 'assets', 'css'),
  prefix: '/css',
  outputStyle: 'expanded'
}))

// On sert les fichiers statiques
app.use(express.static(path.join(__dirname, 'assets')))

// Middleware d'authentification
// app.use((req, res, next) => {
//   if(req.url == '/session')
//     next()
//   else
//     // Vérifier l'authentification
// })

// La liste des différents routeurs (dans l'ordre)
app.use('/', require('./routes/index'))
app.use('/todos', require('./routes/todos'))
app.use('/users', require('./routes/users'))

// Erreur 404
app.use(function(req, res, next) {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

// Gestion des erreurs
// Notez les 4 arguments !!
app.use(function(err, req, res, next) {
  // Les données de l'erreur
  let data = {
    message: err.message,
    status: err.status || 500
  }

  // En mode développement, on peut afficher les détails de l'erreur
  if (app.get('env') === 'development') {
    data.error = err.stack
  }

  // On set le status de la réponse
  res.status(data.status)

  // Réponse multi-format
  res.format({
    html: () => { res.render('error', data) },
    json: () => { res.send(data) }
  })
})

db.open('bdd.db').then(() => {
  console.log('> BDD ouverte')
  return db.run('CREATE TABLE IF NOT EXISTS users (pseudo, firstname, lastname, email, password)')
}).then(() => {
  console.log('> Table users up')
  return db.run('CREATE TABLE IF NOT EXISTS todos (userID, task, description, completed)')
}).then(() => {
  console.log('> Table todos up')
  app.listen(PORT, () => {
    console.log('> Serveur démarré sur le port : ', PORT)
  })
}).catch((err) => {
  console.error('ERR > ', err)
})
