const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
const axios = require("axios");

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  let endp = "http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?shows";

  axios
    .get(endp)
    .then((results) => {
      let showsdata = results.data;
      res.render("index", { showsdata });
    })
    .catch((err) => {
      console.log("Error: ", err.message);
    });
});

app.get("/show", (req, res) => {
  let idvalue = req.query.tvid;
  let getshow = `http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?id=${idvalue}`;

  axios
    .get(getshow)
    .then((results) => {
      let singledata = results.data.show;
      let cast = results.data.cast;

      // Extract actor IDs from the cast array
      let actorIds = cast.map((actor) => actor.actorid);

      // Fetch actor details for each actor ID
      let actorPromises = actorIds.map((actorId) => {
        let actorUrl = `http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?actor=${actorId}`;
        return axios.get(actorUrl);
      });

      // Wait for all actor detail requests to complete
      Promise.all(actorPromises)
        .then((actorResponses) => {
          // Extract actor names from the responses
          let actorNames = actorResponses.map(
            (response) => response.data.actorname
          );

          // Combine the show data with actor names
          singledata.actors = actorNames;

          // Render the details view with the updated data
          res.render("details", { singledata });
        })
        .catch((err) => {
          console.log("Error fetching actor details: ", err.message);
          res.render("details", { singledata }); // Render with original data even if actor details fail
        });
    })
    .catch((err) => {
      console.log("Error fetching show details: ", err.message);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/create", (req, res) => {
  res.render("add");
});

app.get("/create", (req, res) => {
  res.render("add");
});

app.post("/create", (req, res) => {
  let senttitle = req.body.fieldTitle;
  let sentimg = req.body.fieldImg;
  let sentdes = req.body.fieldDescr;

  const showData = {
    title: senttitle,
    img: sentimg,
    description: sentdes,
  };

  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  let epoint =
    "http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?create&apikey=83797150";

  axios
    .post(epoint, showData, config)
    .then((response) => {
      console.log(response.data);
      res.render("add", { showData });
    })
    .catch((err) => {
      console.log(err.message);
    });
});

app.get("/top", async (req, res) => {
  let topshows = await axios.get(
    "http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?topshows"
  );
  let topactors = await axios.get(
    "http://jbusch.webhosting2.eeecs.qub.ac.uk/tvapi/?topactors"
  );
  let showsdata = topshows.data;
  let actorsdata = topactors.data;

  res.render("topdata", { shows: showsdata, actors: actorsdata });
});

app.listen(3000, () => {
  console.log("Server is running at port 3000");
});
