window.GC = window.GC || {};

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
    if(pq.unit.match(/lb/)) return pq.value / 2.2;
    throw "Unrecognized weight unit: " + pq.unit
  },
  any: function(pq){
    return pq.value
  }
};


GC.get_data = function() {
  var dfd = $.Deferred();

  /* Fixed sample patient data!
  Need to replace this witha simple routine that can
  1. Grab the current user's C-CDA
  2. Parse out demographics + vitals */
  $.ajax({
    url: '/my/ccda/summary',
    type: 'get',
    dataType: 'text'
  }).success(function(summary){

    var p = {
      demographics: { },
      vitals:{
        lengthData: [],
        weightData: [],
        BMIData: [],
        headCData: []
      }
    };

    console.log("summary", summary);
    var bb = BlueButton(summary);
    console.log("parsed", bb.data);
    window.d = bb.data;

    p.demographics.name = bb.data.demographics.name.given.join(" ") + 
      " " +  
      bb.data.demographics.name.family;

    p.demographics.birthday = bb.data.demographics.dob;
    p.demographics.gender = bb.data.demographics.gender.toLowerCase();


    function months(d){
      return -1 * new XDate(d).diffMonths(new XDate(p.demographics.birthday));
    }

    bb.data.vitals.forEach(function(v){

      function extractData(code, toUnit, arr){
        byCode(v,code).forEach(function(r){ // weight measured
          arr.push({
            agemos: months(v.date),
            value: unit[toUnit](r)
          }) 
        });
      };

      extractData('3141-9', 'kg', p.vitals.weightData);
      extractData('8302-2', 'cm', p.vitals.lengthData);
      extractData('8287-5', 'cm', p.vitals.headCData);
      extractData('39156-5', 'any', p.vitals.BMIData);

    });
    console.log(p);
    dfd.resolve(p);
  }); 

  return dfd.promise();
};

GC.get_data_fixed = function() {

  var dfd = $.Deferred();

  $.get('fixtures/sample-patient.json')
  .success(function(summary){;
    console.log(summary);
    dfd.resolve(summary);
  }); 
  return dfd.promise();
};

