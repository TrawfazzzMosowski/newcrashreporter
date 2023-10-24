const { v4: uuidv4 } = require('uuid');
const zlib = require('zlib');
const newuuid = uuidv4();
// configure the below
const appname = '<enter app name in NR UI>';
const minCrashLevel = 1;
const accountid = '<enter account id>';
const graphqlKey = $secure.CRASHGRAPHQLKEY;
const insightinsertkey = $secure.CRASHINSERTKEY;
const crashwindow = '30';
// end configureation

var fulloldcrashlist = [];
var alertcrashlist = []; 

async function getCrashDetail(){


  
}

async function zipdata(indata){
   zlib.gzip(indata, (error, data) => {
  
     if(!error)
     {
       // convert to base64
      const insightsInsert = { 
      uri: 'https://insights-collector.newrelic.com/v1/accounts/'+ accountid +'/events',
      headers: {
        'X-Insert-Key': insightinsertkey,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
      body: data,
    };

       $http.post(insightsInsert);
       
       
     }
     else{
    // output error
    console.log(error);
     }
   });
}
    const NrQueryOptions = {
  
      uri: 'https://api.newrelic.com/graphql',
      headers: {
        'API-key': graphqlKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query  {
            actor {
              account(id: ` + accountid + `) {
                id
                nrql(query: "SELECT count(*) FROM MobileCrash SINCE `+ crashwindow +` DAYS AGO facet crashLocation where appName = '`+appname+`' ") {   
                  nrql
                  rawResponse
                }
              }
            }
          
          }
        `,
      }),
    };

const data = await $http.post(NrQueryOptions);
const queryresult = JSON.parse(data.body);

    const NrQueryGetUuid = {
  
      uri: 'https://api.newrelic.com/graphql',
      headers: {
        'API-key': graphqlKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query  {
            actor {
              account(id: ` + accountid + `) {
                id
                nrql(query: "SELECT latest(uuid) FROM CrashHistory SINCE 30 day AGO where appName = '`+appname+`'") {   
                  nrql
                  rawResponse
                }
              }
            }
          
          }
        `,
      }),
    };


const uuidData = await $http.post(NrQueryGetUuid);
const uuidQueryresult = JSON.parse(uuidData.body);

const latestUuid = uuidQueryresult.data.actor.account.nrql.rawResponse.results[0].latest;

    const NrQueryGetonlcrashes = {
  
      uri: 'https://api.newrelic.com/graphql',
      headers: {
        'API-key': graphqlKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query  {
            actor {
              account(id: ` + accountid + `) {
                id
                nrql(query: "SELECT * FROM CrashHistory where uuid = '` + latestUuid + `' SINCE 30 days AGO") {   
                  nrql
                  rawResponse
                }
              }
            }
          
          }
        `,
      }),
    };


const oldCrashesData = await $http.post(NrQueryGetonlcrashes);
const oldCrashQueryresult = JSON.parse(oldCrashesData.body);





for(const copyoldcrash of oldCrashQueryresult.data.actor.account.nrql.rawResponse.results[0].events){  
  var oldcrashupdate ={};
  oldcrashupdate['eventType'] = "CrashHistory";
  oldcrashupdate['crashLocation'] = copyoldcrash.crashLocation;
  oldcrashupdate['uuid'] = newuuid;
  oldcrashupdate['appName'] = appname;
  fulloldcrashlist.push(oldcrashupdate);
}


var found = 0;
for (const newcrash of queryresult.data.actor.account.nrql.rawResponse.facets) {
  found = 0;
  for(const oldcrash of oldCrashQueryresult.data.actor.account.nrql.rawResponse.results[0].events){        
    if(oldcrash.crashLocation === newcrash.name && found ===0){
         found = 1;
    }
   }

  if (found === 0){
    if(newcrash.results[0].count >= minCrashLevel){
        var oldcrashupdate = {};
        oldcrashupdate['eventType'] = "CrashHistory";
        oldcrashupdate['uuid'] = newuuid;
        oldcrashupdate['crashLocation'] = newcrash.name
        oldcrashupdate['appName'] = appname;
        
        fulloldcrashlist.push(oldcrashupdate);
      
        var newcrashupdate = {};
        newcrashupdate['eventType'] = "CrashNewRecord";
        newcrashupdate['appName'] = appname;
        newcrashupdate['uuid'] = newuuid;
        newcrashupdate['crashLocation'] = newcrash.name
      
        alertcrashlist.push(newcrashupdate);
        
    }  
  }
}


        if (alertcrashlist.length > 0){
           const alertcrashjson = JSON.stringify(alertcrashlist);
           await zipdata(alertcrashjson);
           console.log(alertcrashjson);
        }

        console.log("********************");
        const fulloldcrashjson = JSON.stringify(fulloldcrashlist);
        console.log(fulloldcrashjson);
        await zipdata(fulloldcrashjson);



  


