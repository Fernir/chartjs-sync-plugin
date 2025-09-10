# chartjs-sync-plugin

Chart.js 4 synchronized tooltips plugin

![demo](https://github.com/Fernir/chartjs-sync-plugin/raw/master/img.png)

[Demo](https://fernir.github.io/chartjs-sync-plugin/)

## Usage

```js
// --- Helper: generate smoothed random data ---
    const generateSmoothedData = (startDate, count, stepMinutes, startValue = 50, delta = 5) => {
        const labels = [];
        const values = [];
        let current = new Date(startDate);
        let y = startValue;
        for (let i = 0; i < count; i++) {
            labels.push(new Date(current));
            y += Math.floor(Math.random() * 2 * delta - delta); // small random change
            values.push(y);
            current.setMinutes(current.getMinutes() + stepMinutes);
        }
        return { labels, values };
    }

    // --- Parameters ---
    const startDate = "2023-01-01T00:00:00";
    const pointsCount = 100;
    const stepMinutes = 60;

    // --- Chart configurations ---
    const lineCharts = [
        { title: "Chart A", color: "blue" },
        { title: "Chart B", color: "red" },
        { title: "Chart C", color: "green" }
    ];

    const container = document.getElementById("charts");

    // --- Generate charts ---
    lineCharts.forEach(cfg => {
        const div = document.createElement("div");
        div.className = "chart-container";
        const canvas = document.createElement("canvas");
        div.appendChild(canvas);
        container.appendChild(div);

        const { labels, values } = generateSmoothedData(startDate, pointsCount, stepMinutes);

        new Chart(canvas, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: cfg.title,
                    data: values,
                    borderColor: cfg.color,
                    fill: false,       // pure line, no area
                    tension: 0.3       // slight smoothing
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // let canvas fill container height
                scales: {
                    x: {
                        type: "time",
                        time: { unit: "day", tooltipFormat: "dd.MM.yyyy HH:mm" },
                        title: { display: true, text: "Time" }
                    },
                    y: {
                        title: { display: true, text: "Value" }
                    }
                },
                plugins: {
                    sync: { enabled: true, group: 'ourCharts' }, // here are our settings for plugin
                    title: { display: true, text: cfg.title }
                }
            }
        });
    });
```

## License

MIT © Nikolay Alekseev