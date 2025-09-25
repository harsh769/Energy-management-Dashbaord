let chart;
let dataPoints = [];
let devices = []; // Devices array to hold device objects
let isLiveConsumption = true; // Flag to check if live consumption is selected

function initializeDashboardComponents() {
  const liveConsumptionEl = document.getElementById('liveConsumption');
  const deviceList = document.getElementById('deviceList');
  const adminDeviceList = document.getElementById('adminDeviceList');
  const consumptionToggle = document.getElementById('consumptionToggle');

  // Update dashboard (including device list and chart)
  function updateDashboard() {
    let totalConsumption = devices.reduce((sum, device) => sum + device.usage, 0);

    liveConsumptionEl.textContent = `${totalConsumption} W`;

    // Add the current consumption data to the graph only if Live Consumption is selected
    if (isLiveConsumption) {
      dataPoints.push({
        time: new Date().toLocaleTimeString(),
        value: totalConsumption
      });

      if (dataPoints.length > 20) dataPoints.shift(); // Keep only the last 20 data points

      updateChart();
    } else {
      // For overall consumption, freeze the graph and display the total consumption at that point
      if (dataPoints.length === 0) {
        dataPoints.push({
          time: new Date().toLocaleTimeString(),
          value: totalConsumption
        });
      }

      updateChart();
    }

    updateDeviceList();
    updateAdminDeviceList();
  }

  // Update chart based on the data points
  function updateChart() {
    const ctx = document.getElementById('energyChart').getContext('2d');

    if (!chart) {
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dataPoints.map(dp => dp.time),
          datasets: [{
            label: 'Power (W)',
            data: dataPoints.map(dp => dp.value),
            borderColor: 'green',
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true } }
        }
      });
    } else {
      chart.data.labels = dataPoints.map(dp => dp.time);
      chart.data.datasets[0].data = dataPoints.map(dp => dp.value);

      // Update chart only if Live Consumption is selected
      if (isLiveConsumption) {
        chart.update();
      }
    }
  }

  // Update device list on the dashboard
  function updateDeviceList() {
    deviceList.innerHTML = devices.map(device =>
      `<li>${device.name}: ${device.usage} W</li>`
    ).join('');
  }

  // Update the admin device list (for editing and deleting devices)
  function updateAdminDeviceList() {
    adminDeviceList.innerHTML = devices.map((device, index) => `
      <li class="admin-device">
        <input type="text" class="device-input" id="deviceName-${index}" value="${device.name}">
        <input type="number" class="device-input" id="deviceUsage-${index}" value="${device.usage}">
        <button onclick="saveDevice(${index})">Save</button>
        <button onclick="deleteDevice(${index})">Delete</button>
      </li>
    `).join('');
  }

  // Save changes made to device (admin panel)
  window.saveDevice = (index) => {
    const nameInput = document.getElementById(`deviceName-${index}`);
    const usageInput = document.getElementById(`deviceUsage-${index}`);

    devices[index].name = nameInput.value.trim();
    devices[index].usage = parseInt(usageInput.value);

    updateDashboard();
    alert(`Device ${index + 1} updated!`);
  };

  // Delete a device (admin panel)
  window.deleteDevice = (index) => {
    if (confirm("Are you sure you want to delete this device?")) {
      devices.splice(index, 1); // Remove from array
      updateDashboard();
      alert(`Device ${index + 1} deleted!`);
    }
  };

  // Add a new device (admin panel)
  window.addNewDevice = (event) => {
    event.preventDefault();

    const nameInput = document.getElementById('newDeviceName');
    const usageInput = document.getElementById('newDeviceUsage');

    const name = nameInput.value.trim();
    const usage = parseInt(usageInput.value);

    if (name && !isNaN(usage)) {
      const newDevice = { name, usage };
      devices.push(newDevice); // Add to devices array

      updateDashboard();

      nameInput.value = '';
      usageInput.value = '';

      alert(`Device "${name}" added successfully!`);
    } else {
      alert("Please enter valid device details.");
    }
  };

  // Function to change the usage of devices randomly every 5 seconds
  function changeDeviceUsage() {
    devices.forEach(device => {
      // Randomize device usage between 0 and 300 W
      device.usage = Math.floor(Math.random() * 300);
    });
    updateDashboard();
  }

  // Toggle between Live Consumption and Overall Consumption
  consumptionToggle.addEventListener('change', (e) => {
    isLiveConsumption = e.target.checked; // Toggle the flag

    // If switching to Overall Consumption, reset the graph and stop updating
    if (!isLiveConsumption) {
      // Prevent the graph from updating further and show the last data point
      dataPoints = dataPoints.slice(0, 1); // Keep only the first data point (freeze the graph)
      chart.update();
    }

    // Recalculate and update dashboard according to the selected consumption type
    updateDashboard();
  });

  // Initialize dashboard
  updateDashboard();

  // Update live consumption every 5 seconds (only if Live Consumption is selected)
  setInterval(() => {
    if (isLiveConsumption) {
      updateDashboard();
    }
  }, 5000);

  // Randomize device usage every 5 seconds (to simulate real-time changes in devices)
  setInterval(changeDeviceUsage, 5000);
}

function initDashboard() {
  initializeDashboardComponents();
}
