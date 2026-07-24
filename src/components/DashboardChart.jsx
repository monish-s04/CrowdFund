import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from "chart.js";

import {
    Bar,
    Doughnut,
    Line,
} from "react-chartjs-2";


ChartJS.register(
    ArcElement,
    BarElement,
    CategoryScale,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip
);


const textColor = "#cbd5e1";

const gridColor =
    "rgba(148, 163, 184, 0.16)";


function DashboardChart({
    chartData = [],
    categoryData = [],
    statusData = [],
    trustData = [],
}) {

    const labels = chartData.map(
        (item) => item.label
    );

    const amounts = chartData.map(
        (item) =>
            Number(item.amount || 0)
    );

    const donationCounts = chartData.map(
        (item) =>
            Number(item.donations || 0)
    );


    const commonLegend = {
        labels: {
            color: textColor,
            usePointStyle: true,
            padding: 18,
        },
    };


    const axisOptions = {
        responsive: true,

        maintainAspectRatio: false,

        plugins: {
            legend: commonLegend,
        },

        scales: {
            x: {
                ticks: {
                    color: textColor,
                },

                grid: {
                    color: gridColor,
                },
            },

            y: {
                beginAtZero: true,

                ticks: {
                    color: textColor,
                },

                grid: {
                    color: gridColor,
                },
            },
        },
    };


    const doughnutOptions = {
        responsive: true,

        maintainAspectRatio: false,

        cutout: "68%",

        plugins: {
            legend: commonLegend,
        },
    };


    const categoryChartData = {
        labels: categoryData.map(
            (item) => item.label
        ),

        datasets: [
            {
                data: categoryData.map(
                    (item) =>
                        Number(item.value || 0)
                ),

                backgroundColor: [
                    "#38bdf8",
                    "#8b5cf6",
                    "#22c55e",
                    "#f59e0b",
                    "#ec4899",
                    "#14b8a6",
                ],

                borderColor: "#0f172a",

                borderWidth: 3,
            },
        ],
    };


    const statusChartData = {
        labels: statusData.map(
            (item) => item.label
        ),

        datasets: [
            {
                data: statusData.map(
                    (item) =>
                        Number(item.value || 0)
                ),

                backgroundColor: [
                    "#22c55e",
                    "#f59e0b",
                    "#ef4444",
                ],

                borderColor: "#0f172a",

                borderWidth: 3,
            },
        ],
    };


    return (
        <div className="analytics-chart-grid">

            <ChartCard
                title="Funds Raised by Month"
            >
                <Bar
                    data={{
                        labels,

                        datasets: [
                            {
                                label:
                                    "Funds Raised (₹)",

                                data: amounts,

                                backgroundColor:
                                    "rgba(56, 189, 248, 0.72)",

                                borderColor:
                                    "#38bdf8",

                                borderWidth: 1,

                                borderRadius: 10,

                                maxBarThickness: 55,
                            },
                        ],
                    }}

                    options={{
                        ...axisOptions,

                        scales: {
                            ...axisOptions.scales,

                            y: {
                                beginAtZero: true,

                                ticks: {
                                    color:
                                        textColor,

                                    callback:
                                        function (
                                            value
                                        ) {
                                            return (
                                                `₹${Number(
                                                    value
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}`
                                            );
                                        },
                                },

                                grid: {
                                    color:
                                        gridColor,
                                },
                            },
                        },
                    }}
                />
            </ChartCard>


            <ChartCard
                title="Monthly Donation Trend"
            >
                <Line
                    data={{
                        labels,

                        datasets: [
                            {
                                label:
                                    "Donation Count",

                                data:
                                    donationCounts,

                                borderColor:
                                    "#22c55e",

                                backgroundColor:
                                    "rgba(34, 197, 94, 0.12)",

                                pointBackgroundColor:
                                    "#22c55e",

                                pointRadius: 4,

                                pointHoverRadius: 6,

                                tension: 0.35,

                                fill: true,
                            },
                        ],
                    }}

                    options={axisOptions}
                />
            </ChartCard>


            <ChartCard
                title="Campaign Categories"
                small
            >
                <Doughnut
                    data={categoryChartData}

                    options={
                        doughnutOptions
                    }
                />
            </ChartCard>


            <ChartCard
                title="Approval Status"
                small
            >
                <Doughnut
                    data={statusChartData}

                    options={
                        doughnutOptions
                    }
                />
            </ChartCard>


            <ChartCard
                title="AI Trust Distribution"
            >
                <Bar
                    data={{
                        labels:
                            trustData.map(
                                (item) =>
                                    item.label
                            ),

                        datasets: [
                            {
                                label:
                                    "Campaigns",

                                data:
                                    trustData.map(
                                        (item) =>
                                            Number(
                                                item.value
                                                || 0
                                            )
                                    ),

                                backgroundColor: [
                                    "rgba(34, 197, 94, 0.75)",
                                    "rgba(245, 158, 11, 0.75)",
                                    "rgba(239, 68, 68, 0.75)",
                                ],

                                borderRadius:
                                    10,

                                maxBarThickness:
                                    55,
                            },
                        ],
                    }}

                    options={{
                        ...axisOptions,

                        indexAxis: "y",
                    }}
                />
            </ChartCard>

        </div>
    );
}


function ChartCard({
    title,
    children,
    small = false,
}) {

    return (
        <article className="chart-card">

            <span>
                ANALYTICS
            </span>

            <h3>
                {title}
            </h3>

            <div
                className={
                    small
                        ? "chart-canvas small"
                        : "chart-canvas"
                }
            >
                {children}
            </div>

        </article>
    );
}


export default DashboardChart;