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

function DashboardChart() {
    const data = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                label: "Funds Raised (₹)",
                data: [20000, 45000, 35000, 65000, 55000, 90000],
                backgroundColor: "#38bdf8",
                borderRadius: 10,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: "white",
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
                ticks: {
                    color: "#cbd5e1",
                },
                grid: {
                    color: "#334155",
                },
            },
        },
    };

    return <Bar data={data} options={options} />;
}

export default DashboardChart;