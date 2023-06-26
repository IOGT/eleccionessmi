function hexToRgb(hex) {
  // Remove the # symbol if present
  hex = hex.replace("#", "");

  // Check if the hex value is shorthand (e.g., #ABC)
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map(function (char) {
        return char + char;
      })
      .join("");
  }

  // Parse the hex value to decimal
  var decimal = parseInt(hex, 16);

  // Extract the RGB components
  var red = (decimal >> 16) & 255;
  var green = (decimal >> 8) & 255;
  var blue = decimal & 255;

  // Return the RGB values as an object
  return {
    r: red,
    g: green,
    b: blue,
  };
}
var app = new Vue({
  el: "#app",
  components: {
    apexchart: VueApexCharts,
  },
  data: {
    progress: 0,
    totalActas: 0,
    actasDigitadas: 0,
    actasContabilizadas: 0,
    pidsInfo: {},
    pidsPA: {},
    message: "",
    title: "SMI",
    chartData: {
      labels: ["Boller", "Brus", "Chips", "Frukt", "Fisk", "Snop"],
      datasets: [{ data: [12, 9, 3, 5, 2, 15], borderWidth: 2 }],
    },
    // donut data
    progressData: {
      labels: ["Digitadas", "Pendientes"],
      datasets: [{ data: [50, 50], borderWidth: 2 }],
    },
    series: [
      {
        data: [21, 22, 10, 28, 16, 21, 13, 30],
      },
    ],
    chartOptions: {
      chart: {
        height: 350,
        type: "bar",
        events: {
          click: function (chart, w, e) {
            // console.log(chart, w, e)
          },
        },
      },
      colors: [],
      plotOptions: {
        bar: {
          columnWidth: "45%",
          distributed: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      xaxis: {
        categories: [
          ["John", "Doe"],
          ["Joe", "Smith"],
          ["Jake", "Williams"],
          "Amber",
          ["Peter", "Brown"],
          ["Mary", "Evans"],
          ["David", "Wilson"],
          ["Lily", "Roberts"],
        ],
        labels: {
          style: {
            colors: [],
            fontSize: "12px",
          },
        },
      },
    },
  },
  mounted() {
    this.fetchData(); // Fetch data on page load

    // Refresh data every 10 seconds
    setInterval(this.fetchData, 10000);
  },
  methods: {
    fetchData() {
      const urlCorte =
        "https://corsproxy.io/?" +
        encodeURIComponent(
          "https://trep.gt/ext/jsonData_gtm2023/ultimoCorte.json"
        );

      axios.get(urlCorte).then((response) => {
        console.log("Ultimo corte")
        console.log(response.data.dir)
        const ultimoCorte = response.data.dir;

        
      const url =
      "https://corsproxy.io/?" +
      encodeURIComponent(
        `https://trep.gt/ext/jsonData_gtm2023/${ultimoCorte}/gtm2023_tc4_e13.json`
      );
    axios
      .get(url)
      .then((response) => {
        // this.data = response.data;
        // console.log(response.data.divs[17]);
        let data_municipio = response.data.divs[17];
        this.pidsInfo = data_municipio.pidsInfo;
        this.pidsPA = data_municipio.pidsPA;
        let votosPA = data_municipio.votosPA;
        console.log(data_municipio)
        console.log(votosPA)

        const partidos_names = this.pidsPA.map(
          (pid) => this.pidsInfo[pid].siglas
        );
        const partidos_colores = this.pidsPA.map((pid) =>
          hexToRgb(this.pidsInfo[pid].color)
        );
        const votos_partidos = this.pidsPA.map(
          (pid) => parseInt(votosPA[pid].num) || 0
        );
        console.log(votos_partidos);
        this.chartData.labels = partidos_names;
        this.chartData.datasets[0].data = votos_partidos;
        // this.chartOptions.series[0].data = votos_partidos;

        this.chartData.backgroundColor = partidos_colores;
        this.chartData.datasets[0].backgroundColor = partidos_colores.map(
          (color) => `rgba(${color.r}, ${color.g}, ${color.b}, 0.2)`
        );
        this.chartData.datasets[0].borderColor = partidos_colores.map(
          (color) => `rgba(${color.r}, ${color.g}, ${color.b}, 0.2)`
        );

        // Calculate the sum of all data points
        const sum = votos_partidos.reduce((total, value) => total + value, 0);

        // Calculate the relative percentage for each data point
        const relativePercentages = votos_partidos.map(
          (value) => ((value / sum) * 100).toFixed(2) + "%"
        );

        // Add the relative percentages to the chart labels
        this.chartData.labels = partidos_names.map(
          (name, index) => `${name} (${relativePercentages[index]})`
        );

        this.chartOptions.xaxis.categories =  partidos_names.map(
          (name, index) => `${name} (${relativePercentages[index]})`
        );

        const totalActas = data_municipio.stats.actas.num;
        this.totalActas = totalActas;
        // console.log(totalActas)
        const actasDigitadas = data_municipio.stats.actas.capt.num;
        this.actasDigitadas = actasDigitadas;
        // console.log(actasDigitadas)
        const actasContabilizadas = data_municipio.stats.actas.cont.num;
        this.actasContabilizadas = actasContabilizadas;
        // console.log(actasContabilizadas)

        const porcentajeContabilizada = data_municipio.stats.actas.cont.pct4;
        // console.log(porcentajeContabilizada)
        // progress rounded to 2 decimals
        this.progress = Math.round(porcentajeContabilizada * 100) / 100;
        // this.progress = 50
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });


      });



    },
  },
});
