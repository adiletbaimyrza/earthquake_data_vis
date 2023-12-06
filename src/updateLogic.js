const updateShares = (data, entireDataset, sharesSetter) => {
  const sharesPercentage = ((data.length / entireDataset.length) * 100).toFixed(
    1,
  );
  sharesSetter(sharesPercentage);
};

const updateQuakeNumber = (data, quakeNumberSetter) => {
  const quakeNumber = data.length;
  quakeNumberSetter(quakeNumber);
};

const updatePieChart = (data, pieChartDataSetter) => {
  const pieChartData = data.reduce((counts, record) => {
    const magType = record.magType;
    counts[magType] = (counts[magType] || 0) + 1;
    return counts;
  }, {});

  const pieChartLabels = Object.keys(pieChartData);
  const pieChartValues = Object.values(pieChartData);

  pieChartDataSetter({
    type: "pie",
    data: {
      labels: pieChartLabels,
      datasets: [
        {
          label: "Records by Magnitude Type",
          data: pieChartValues,
        },
      ],
    },
    options: {
      aspectRatio: 1.1,
    },
  });
};

const updateBarChart = (data, barChartDataSetter) => {
  const barChartData = data.reduce((counts, record) => {
    const magSource = record.magSource;
    counts[magSource] = (counts[magSource] || 0) + 1;
    return counts;
  }, {});

  const sortedBarChartData = Object.entries(barChartData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const sortedBarChartDataJSON = Object.fromEntries(sortedBarChartData);

  const barChartLabels = Object.keys(sortedBarChartDataJSON);
  const barChartValues = Object.values(sortedBarChartDataJSON);

  barChartDataSetter({
    type: "bar",
    data: {
      labels: barChartLabels,
      datasets: [
        {
          label: "Records by Source Type",
          data: barChartValues,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      aspectRatio: 1.1,
    },
  });
};

const updateLineChart = (data, lineChartDataSetter) => {
  const lineChartData = data.reduce((counts, record) => {
    const mag = record.mag;
    counts[mag] = (counts[mag] || 0) + 1;
    return counts;
  }, {});

  const lineChartLabels = Object.keys(lineChartData);
  const lineChartValues = Object.values(lineChartData);

  lineChartDataSetter({
    type: "line",
    data: {
      labels: lineChartLabels,
      datasets: [
        {
          label: "Number of earthquakes",
          data: lineChartValues.map((value, index) => ({
            x: lineChartLabels[index],
            y: value,
            label: `Custom label for point ${index}`,
          })),
          fill: true,
          backgroundColor: "rgba(75,192,192,0.4)",
          borderColor: "rgba(75,192,192,1)",
        },
      ],
    },
    options: {
      aspectRatio: 6.4,
    },
  });
};

const updateMap = (data, mapDataSetter) => {
  const longitudes = data.map((record) => parseFloat(record.longitude));
  const latitudes = data.map((record) => parseFloat(record.latitude));
  const bubbleSizes = data.map((record) => parseFloat(record.bubble_size));
  const colors = data.map((record) => record.color);

  mapDataSetter({ longitudes, latitudes, bubbleSizes, colors });
};

export {
  updateShares,
  updateQuakeNumber,
  updatePieChart,
  updateBarChart,
  updateLineChart,
  updateMap,
};
