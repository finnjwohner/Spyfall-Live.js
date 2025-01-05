const suggestionInfo = document.querySelector("div.suggestions-info");
const suggestionsSent = document.querySelector("div.suggestions-sent");

const reportTypeInput = document.querySelector("#report-type");
const reportInput = document.querySelector("#report");
const emailInput = document.querySelector("#email");
const submitButton = document.querySelector("#submit");
const submitAnotherButton = document.querySelector("#submit-another-button");

const reportTypeError = document.querySelector("#report-type-error");
const reportError = document.querySelector("#report-error");

const sendingReportText = document.querySelector("#sending-text");

const validReportTypes = ["bug", "suggestion"];

const validate = () => {
  if (!validReportTypes.includes(reportTypeInput.value)) {
    reportTypeError.style.display = "inline-block";
    reportTypeInput.focus();
    return false;
  }

  if (reportInput.value.length === 0) {
    reportError.style.display = "inline-block";
    reportInput.focus();
    return false;
  }

  reportTypeError.style.display = "none";
  reportError.style.display = "none";

  return true;
};

const onSubmit = async (e) => {
  if (!validate()) {
    submitButton.style.display = "inline-block";
    sendingReportText.style.display = "none";
    return false;
  }

  const bodyJSON = JSON.stringify({
    reportType: reportTypeInput.value,
    report: reportInput.value,
    email: emailInput.value,
  });

  submitButton.style.display = "none";
  sendingReportText.style.display = "inline-block";

  try {
    const response = await fetch("./suggestions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: bodyJSON,
    });

    if (!response.ok) {
      throw new Error("Network error");
    }

    submitButton.style.display = "inline-block";
    sendingReportText.style.display = "none";
    suggestionInfo.style.display = "none";
    suggestionsSent.style.display = "block";
  } catch (error) {
    console.error(error);
  }
};

submitButton.addEventListener("mousedown", onSubmit);
submitAnotherButton.addEventListener("mousedown", () => {
  suggestionInfo.style.display = "block";
  suggestionsSent.style.display = "none";
  reportTypeInput.value = "bug";
  reportInput.value = "";
});
