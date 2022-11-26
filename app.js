const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "covid19India.db");
const app = express();

app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    db = await open({ filename: databasePath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`Data base error is ${error}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject2 = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

const convertDbObjectToResponseObject1 = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

const convertDbObjectToResponseObject3 = (dbObject) => {
  return {
    //stateId: dbObject.state_id,
    totalCases: dbObject.cases,
    totalCured: dbObject.cured,
    totalActive: dbObject.active,
    totalDeaths: dbObject.deaths,
  };
};

const convertDbObjectToResponseObject4 = (dbObject) => {
  return {
    stateId: dbObject.state_id,
  };
};

app.get("/states/", async (request, response) => {
  const getStates = `select * from state;`;
  const states = await db.all(getStates);
  response.send(states.map((each) => convertDbObjectToResponseObject2(each)));
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStates = `select * from state where state_id = ${stateId};`;
  const states = await db.get(getStates);
  response.send(convertDbObjectToResponseObject2(states));
});

app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const postDis = `insert into district (district_name,state_id,cases,cured,active,deaths) 
  values('${districtName}','${stateId}','${cases}','${cured}','${active}','${deaths}');`;
  const dis = await db.run(postDis);
  response.send("District Successfully Added");
});

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrict = `select * from district where district_id = ${districtId};`;
  const dis = await db.get(getDistrict);
  response.send(convertDbObjectToResponseObject1(dis));
});

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const delDist = `delete from district where district_id = ${districtId};`;
  const dis = await db.run(delDist);
  response.send("District Removed");
});

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const updateDistrictQuery = `update district set
    district_name = '${districtName}',
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths} where district_id = ${districtId};`;

  const updateDistrictQueryResponse = await db.run(updateDistrictQuery);
  response.send("District Details Updated");
});

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStats = `select sum(cases) as totalCases, sum(cured) as totalCured,
    sum(active) as totalActive , sum(deaths) as totalDeaths from district where state_id = ${stateId};`;
  const stats = await db.get(getStats);
  response.send(stats);
});

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `select state_id from district where district_id = ${districtId};`;
  const getDistrictIdQueryResponse = await db.get(getDistrictIdQuery);
  const getStateNameQuery = `select state_name as stateName from state where 
  state_id = ${getDistrictIdQueryResponse.state_id}`;
  const getStateNameQueryResponse = await db.get(getStateNameQuery);
  response.send(getStateNameQueryResponse);
  //response.send(convertDbObjectToResponseObject4(state));
});

module.exports = app;
