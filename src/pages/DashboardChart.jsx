import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
);

function DashboardChart({ chartData = [] }) {
    const labels =
        chartData.length > 0
            ? chartData.map((item) => item.label)
            : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

    const values =
        chartData.length > 0
            ? chartData.map((item) => Number(item.amount || 0))
            : [0, 0, 0, 0, 0, 0];

    const data = {
        labels,
        datasets: [
            {
                label: "Funds Raised (₹)",
                data: values,
                backgroundColor: "#38bdf8",
                borderRadius: 10,
                maxBarThickness: 55,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                labels: {
                    color: "#f8fafc",
                },
            },

            tooltip: {
                callbacks: {
                    label: function (context) {
                        const value = Number(context.raw || 0);

                        return `Funds Raised: ₹${value.toLocaleString(
                            "en-IN"
                        )}`;
                    },
                },
            },
        },

        scales: {
            x: {
                ticks: {
                    color: "#cbd5e1",
                },

                grid: {
                    color: "#334155",
                },
            },

            y: {
                beginAtZero: true,

                ticks: {
                    color: "#cbd5e1",

                    callback: function (value) {
                        return `₹${Number(value).toLocaleString(
                            "en-IN"
                        )}`;
                    },
                },

                grid: {
                    color: "#334155",
                },
            },
        },
    };

    return (
        <div style={{ height: "320px" }}>
            <Bar
                data={data}
                options={options}
            />
        </div>
    );
}

export default DashboardChart;