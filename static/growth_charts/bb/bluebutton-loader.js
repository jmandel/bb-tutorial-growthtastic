window.GC = window.GC || {};

GC.get_data = function() {

  var dfd = $.Deferred();

  $.get('/my/ccda/summary')
  .success(function(summary){;
    console.log(summary);
    dfd.resolve(summary);
  }); 

  return dfd.promise();
};

GC.get_data_fixed = function() {
  var dfd = $.Deferred();

  /* Fixed sample patient data!
     Need to replace this witha simple routine that can
     1. Grab the current user's C-CDA
     2. Parse out demographics + vitals */
  $.get('fixtures/sample-patient.json')
  .success(function(patient){
    dfd.resolve(patient);
  }); 

  return dfd.promise();
};
