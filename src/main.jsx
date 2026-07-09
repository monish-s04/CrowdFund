import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import "./css/common.css";
import "./css/loader.css";
import "./css/navbar.css";
import "./css/landing.css";
import "./css/auth.css";
import "./css/dashboard.css";
import "./css/campaign.css";
import "./css/campaignDetails.css";
import "./css/createCampaign.css";
import "./css/profile.css";
import "./css/about.css";
import "./css/contact.css";
import "./css/footer.css";
import "./css/admin.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);