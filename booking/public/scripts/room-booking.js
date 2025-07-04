let startDatePicker = null;
let endDatePicker = null;

let bookings = [
  {
    start_date: "2025-07-01",
    end_date: "2025-07-05",
  },
  {
    start_date: "2025-07-10",
    end_date: "2025-07-15",
  },
  {
    start_date: "2025-07-20",
    end_date: "2025-07-25",
  },
];

// Make the container visible (if it was initially hidden)
const unavailableDates = bookings.map((booking) => ({
  from: booking.start_date, // Angenommen, start_date ist ein SQL DATE/DATETIME
  to: booking.end_date, // Angenommen, end_date ist ein SQL DATE/DATETIME
}));

// init flatpickr for date selection
startDatePicker = flatpickr("#startDate", {
  dateFormat: "Y-m-d",
  minDate: "today",
  disable: unavailableDates,
  onChange: function (selectedDates, dateStr, instance) {
    if (selectedDates.length > 0) {
      const selectedStartDate = selectedDates[0];
      selectedStartDate.setHours(0, 0, 0, 0); // Normalisiere auf Tagesanfang für genaue Vergleiche

      // Setze das Minimum für den Enddatums-Picker auf das gewählte Startdatum
      endDatePicker.set("minDate", selectedStartDate);

      let earliestBlockingDate = null; // Speichert das Startdatum des *ersten* blockierenden Zeitraums nach dem gewählten Startdatum

      // Durchlaufe alle deaktivierten Zeiträume
      for (const disabledRange of unavailableDates) {
        const disabledFrom = new Date(disabledRange.from);
        disabledFrom.setHours(0, 0, 0, 0); // Normalisiere auf Tagesanfang

        // Wenn der deaktivierte Zeitraum *strikt nach* dem gewählten Startdatum beginnt
        if (disabledFrom > selectedStartDate) {
          // Wenn dies der erste gefundene blockierende Zeitraum ist ODER
          // wenn dieser blockierende Zeitraum früher beginnt als ein zuvor gefundener
          if (!earliestBlockingDate || disabledFrom < earliestBlockingDate) {
            earliestBlockingDate = disabledFrom;
          }
        }
      }

      // Wenn ein blockierender Zeitraum gefunden wurde, setze das maximale Enddatum
      if (earliestBlockingDate) {
        const maxSelectableEndDate = new Date(earliestBlockingDate);
        // Erlaube die Auswahl bis zum Tag *vor* dem Beginn des blockierenden Zeitraums
        maxSelectableEndDate.setDate(maxSelectableEndDate.getDate() - 1);

        // Stelle sicher, dass das berechnete maxDate nicht vor dem Startdatum liegt (Edge Case)
        if (maxSelectableEndDate >= selectedStartDate) {
          endDatePicker.set("maxDate", maxSelectableEndDate);
        } else {
          // Sollte normalerweise nicht passieren, aber als Fallback
          endDatePicker.set("maxDate", null);
        }
      } else {
        // Wenn kein blockierender Zeitraum nach dem Startdatum gefunden wurde,
        // entferne jegliche maxDate-Beschränkung für den Enddatums-Picker
        endDatePicker.set("maxDate", null); // Erlaubt Auswahl weit in die Zukunft
      }

      // Optional: Wenn das bereits gewählte Enddatum nun ungültig ist, setze es zurück
      if (
        (endDatePicker.selectedDates.length > 0 &&
          endDatePicker.selectedDates[0] < selectedStartDate) ||
        (earliestBlockingDate &&
          endDatePicker.selectedDates[0] >= earliestBlockingDate)
      ) {
        endDatePicker.clear();
      }
    } else {
      // Wenn das Startdatum gelöscht wird, setze min/max Daten des Enddatums-Pickers zurück
      endDatePicker.set("minDate", "today");
      endDatePicker.set("maxDate", null);
      endDatePicker.clear(); // Auch das Enddatum löschen
    }
  },
});

endDatePicker = flatpickr("#endDate", {
  dateFormat: "Y-m-d",
  minDate: "today",
  disable: unavailableDates,
});

function closeBookingView() {
  window.parent.postMessage("closeBookingModal", "http://localhost:82");

  if (startDatePicker) {
    startDatePicker.destroy();
    startDatePicker = null; // Setze die Referenz zurück
  }
  if (endDatePicker) {
    endDatePicker.destroy();
    endDatePicker = null; // Setze die Referenz zurück
  }
}
