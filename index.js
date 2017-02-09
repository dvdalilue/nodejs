var express = require('express');
var firebase = require('firebase');

var config = {
    apiKey: "AIzaSyAo6t87dpnHv6q1vSIq1nR0JPhaTZ5O1xg",
    authDomain: "test-krono.firebaseapp.com",
    databaseURL: "https://test-krono.firebaseio.com",
    storageBucket: "test-krono.appspot.com",
    messagingSenderId: "842158548684"
  };
firebase.initializeApp(config);

var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

firebase.database().ref('productos').on("child_changed", function(snapshot) {
    firebase.auth().signInAnonymously().catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log('error: ' + errorCode + ', ' + errorMessage)
    });

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            firebase.database().ref('modificados/' + snapshot.key).push(
                (new Date().toString())
            );
            const nodemailer = require('nodemailer');

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'krononodejs@gmail.com',
                    pass: 'nodejskrono'
                }
            });

            let mailOptions = {
                from: '"KronoApp" <no-reply@test-krono.com>', // sender address
                to: 'dvdalilue@gmail.com', // list of receivers
                subject: '[Krono] Producto cambiado: \'' + snapshot.val().nombre + '\'', // Subject line
                html: 'El Producto \'' + snapshot.val().nombre + '\' ha sido modificado' // html body
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
            });
        }
    });
});