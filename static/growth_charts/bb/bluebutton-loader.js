window.GC = window.GC || {};

GC.get_data = function() {
  var dfd = $.Deferred();

  BBClient.summary()
  .fail(fail)
  .success(extractVitals);

  function extractVitals(summary){

    // Initialize an empty patient structure
    var p = {
      demographics: { },
      vitals:{
        lengthData: [],
        weightData: [],
        BMIData: [],
        headCData: []
      }
    };

    // Parse C-CDA string with BlueButton.js
    var bb = BlueButton(summary);

    // For debugging, a global handle on the output
    window.d = bb.data;
    console.log("Check out the parsed BlueButton.js data in: window.d");

    var name = bb.data.demographics.name;
    p.demographics.name = name.given.join(" ") + " " +  name.family;
    p.demographics.birthday = bb.data.demographics.dob;
    p.demographics.gender = bb.data.demographics.gender.toLowerCase();

    function months(d){
      return -1 * new XDate(d).diffMonths(new XDate(p.demographics.birthday));
    }

    bb.data.vitals.forEach(function(v){

      extractData('3141-9',  unit.kg,  p.vitals.weightData);
      extractData('8302-2',  unit.cm,  p.vitals.lengthData);
      extractData('8287-5',  unit.cm,  p.vitals.headCData);
      extractData('39156-5', unit.any, p.vitals.BMIData);

      function extractData(code, toUnit, arr){
        byCode(v, code).forEach(function(r){
          arr.push({
            agemos: months(v.date, bb.data.demographics.dob),
            value: toUnit(r)
          })
        });
      };

    });
    window.p = p;
    console.log("Check out the patient's growth data in: window.p");
    dfd.resolve(p);
  }

  function fail(response, error, msg){
    console.log("failed", arguments);
    dfd.reject(response);
  };

  return dfd.promise();
};

function byCode(v, code){
  return v.results.filter(function(r){
    return (r.code === code);
  });
}

var unit = {
  cm: function(pq){
    if(pq.unit == "cm") return pq.value;
    if(pq.unit == "m") return 100*pq.value;
    if(pq.unit == "in") return 2.54*pq.value;
    if(pq.unit == "[in_us]") return 2.54*pq.value;
    if(pq.unit == "[in_i]") return 2.54*pq.value;
    throw "Unrecognized length unit: " + pq.unit
  },
  kg: function(pq){
    if(pq.unit == "kg") return pq.value;
    if(pq.unit.match(/lb/)) return pq.value / 2.20462;
    throw "Unrecognized weight unit: " + pq.unit
  },
  any: function(pq){
    return pq.value
  }
};



