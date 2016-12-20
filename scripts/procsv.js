var Procsv = {
  sheets: function(sheet) {
    var csv = '';

    $.ajax({
      url: 'csv/' + sheet + '.csv',
      type: 'get',
      dataType: 'text',
      async: false,
      success: function(data) { csv = data; }
    });

    if (csv === '') {
      alert('Could not load ' + sheet + ' sheet.');
      return;
    }

    csv = $.csv.toObjects(csv);

    return {'elements': csv};
  }
};
