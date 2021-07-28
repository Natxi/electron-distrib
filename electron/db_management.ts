import * as Electron from 'electron';
// import * as mongoose from "mongoose";
import { Schema, model, connect, connection } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
interface ITestDB {
  name: string;
}

// 2. Create a Schema corresponding to the document interface.
const DBTestSchema = new Schema<ITestDB>({
  name: String
});


// 3. Create a Model.
const Test = model<ITestDB>('Test', DBTestSchema);

function addHandler() {
  Electron.ipcMain.on('addDB', (event, arg) => {
    const greet = new Test(arg);
    greet.save((err, saved) => {
      if (err) {
        console.log(`error saving into db ${JSON.stringify(err)}`);
        event.returnValue = false;
      } else {
        console.log('saving into db successfully!');
        event.returnValue = true;
      }
    })
  });
}

function retrieveHandler() {
  Electron.ipcMain.on('retrieveDB', (event, arg) => {

    Test.find({}).lean().exec((err, greets) => {
      if (err) {
        console.log(`error retrieving from db ${JSON.stringify(err)}`);
        event.returnValue = false;
      } else {
        greets.forEach(greet => {
          console.log('retrieve', greet.name);
        })
        event.returnValue = greets;
      }
    });
  });
}

export function connectToMongoDB() {
  connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});
  const db = connection;
  db.on('error', console.error.bind(console, 'connection error: '));
  db.once('open', () => {
    console.log('connected!');
    addHandler();
    retrieveHandler();
  });

}
