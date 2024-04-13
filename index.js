const functions = require("firebase-functions");
const express = require("express");
const app = express();
const admin=require("firebase-admin");
app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", ["*"]);
  res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  next();
});
admin.initializeApp({
    credential: admin.credential.cert("./permissions.json"),
  });
const db = admin.firestore();
  // Insertar un objeto
  app.post("/api/maquillaje", async (req, res) => {
    try {
      const lastDoc = await db.collection("maquillaje")
          .orderBy("id", "desc")
          .limit(1)
          .get();
      let nextId = 1;
      if (!lastDoc.empty) {
        const lastId = lastDoc.docs[0].data().id;
        nextId = lastId + 1;
      }
      const notaData = {
        id: nextId,
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        precio: req.body.precio,
      };
      await db.collection("maquillaje")
          .doc(nextId.toString())
          .set(notaData);
      return res.status(200).json();
    } catch (error) {
      console.error("Error al crear la nota:", error);
      return res.status(500).json({error: "Ocurrió un error al crear la nota."});
    }
  });
  // Mostrar 1 solo objeto
  app.get("/api/maquillaje/:maquillaje_id", async (req, res) => {
    try {
      const doc = db.collection("maquillaje").doc(req.params.maquillaje_id);
      const item = await doc.get();
      const response = item.data();
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).send(error);
    }
  });
  // Mostrar todos los objetos
 app.get("/api/maquillaje", async (req, res) => {
    try {
      const query = db.collection("maquillaje");
      const querySnapshot = await query.get();
      const docs = querySnapshot.docs;
      const response = docs.map((doc) => ({
        id: doc.id,
        nombre: doc.data().nombre,
        descripcion: doc.data().descripcion,
        precio: doc.data().precio,
      }));
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json();
    }
  });
  // Eliminar objeto
  app.delete("/api/maquillaje/:maquillaje_id", async (req, res) => {
    try {
      const document = db.collection("maquillaje").doc(req.params.maquillaje_id);
      await document.delete();
      return res.status(200).json();
    } catch (error) {
      return res.status(500).json();
    }
  });
  // Actualizar un objeto
  app.put("/api/maquillaje/:maquillaje_id", async (req, res) => {
    try {
      const document = db.collection("maquillaje").doc(req.params.maquillaje_id);
      await document.update({
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        precio: req.body.precio,
      });
      return res.status(200).json();
    } catch (error) {
      return res.status(500).json();
    }
});
exports.app = functions.https.onRequest(app);