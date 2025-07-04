let datePicker = null;

// init flatpickr for date selection
datePicker = flatpickr("#startDate", {
  dateFormat: "Y-m-d",
  minDate: "today",
});

function closeBookingView() {
  window.parent.postMessage("closeBookingModal", "http://localhost:83");

  if (datePicker) {
    datePicker.destroy();
    datePicker = null; // Setze die Referenz zurück
  }
}
