window.GC = window.GC || {};

// Using a simple fixture for now
GC.get_data = function() {
  return $.get('fixtures/sample-patient.json');
};

