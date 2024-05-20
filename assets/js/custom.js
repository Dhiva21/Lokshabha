$(document).ready(function () {
  function setData() {
    // Assembly

    fetch(
      "https://script.google.com/macros/s/AKfycbz_u-jjbMfGeVnirSRZtme6L7oN5MIw2AQfgtUtfGY1xxasn4v-JD2jLMVQU2iMVtU/exec"
    )
      .then((response) => response.json())
      .then((assemblyData) => {
        if (assemblyData && assemblyData.content.lokShabha1) {
          createRows(assemblyData.content.lokShabha1);
        } else {
          console.error("Error: Data is missing lokShabha1 property");
        }
      })
      .catch((error) => console.error("Error:", error));

    function createRows(data) {
      var container = document.querySelector(".assembly");
      container.innerHTML = ""; // Clear previous content

      data.forEach((item) => {
        var row = document.createElement("div");
        row.className = "row align-items-center borderBottom1";

        var stateCol = document.createElement("div");
        stateCol.className = "col-4 ";
        stateCol.innerHTML = `<p class="stateName">${item.State}</p>`;
        row.appendChild(stateCol);

        var partyCol = document.createElement("div");
        partyCol.className = "col-4 ";
        partyCol.innerHTML = `<div class=""><p class="partyName">${item.Party}</p></div>`;
        row.appendChild(partyCol);

        var statusCol = document.createElement("div");
        statusCol.className = "col-4";
        var statusImage = document.createElement("img");
        statusImage.className = "img-fluid customStateImg1";

        if (item.Status.toLowerCase() === "leading") {
          statusImage.src = "assets/images/leadState.png"; // Path to leading image
          statusImage.alt = "Leading Icon";
        } else {
          statusImage.src = "assets/images/trailing.png"; // Path to trailing image
          statusImage.alt = "Trailing Icon";
        }
        statusCol.appendChild(statusImage);
        row.appendChild(statusCol);

        container.appendChild(row);
      });
    }

    // Progress

    fetch(
      "https://script.google.com/macros/s/AKfycbx9JZeT1GOpS7MtAQS9xZgcg4aVHbiK5iFtXLlvqm7iJn6qla5tgqpN2HnzetJaAA4/exec"
    )
      .then((response) => response.json())
      .then((progressData) => {
        console.log(progressData); // Log the data to inspect its structure
        const progressContainer = document.getElementById("progress-container");
        progressContainer.innerHTML = ""; // Clear previous content

        if (
          progressData.content &&
          progressData.content.lokShabha &&
          Array.isArray(progressData.content.lokShabha)
        ) {
          progressData.content.lokShabha.forEach((partyData) => {
            const progressBar = createProgressBar(partyData);
            progressContainer.innerHTML += progressBar;
          });
        } else {
          console.error("Unexpected data structure:", progressData);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));

    function createProgressBar(partyData) {
      const { Party, Won, Lead } = partyData;
      const total = Won + Lead;
      const winPercentage = (Won / total) * 100;
      const leadPercentage = (Lead / total) * 100;

      if (Won === 0) {
        $(".won").hide();
        $(".wonBar").hide();
      } else {
        $(".won").show();
        $(".wonBar").show();
      }

      if (Party === "OTHERS" && Won === 0) {
        $(".won").hide();
        $(".wonBar").hide();
      } else {
        $(".won").show();
        $(".wonBar").show();
      }

      let winColor = "";
      let leadColor = "bg-success"; // Default color for lead

      if (Party.toUpperCase() === "NDA") {
        winColor = "ndaBg";
      } else if (Party.toUpperCase() === "OTHERS") {
        winColor = "otherBg";
      } else if (Party.trim().toUpperCase() === "INDIA") {
        winColor = "indiaBg";
      } else {
        winColor = "bg-danger"; // Default to "indiaBg" if no match is found
      }

      return `
            <div class="col-md-12">
                <div class="row g-3 align-items-center mb-3">
                    <div class="col-md-2 col-4">
                        <label for="${Party}" class="col-form-label progressLabel">${Party}</label>
                    </div>
                    <div class="col-md-10 col-8">
                        <div class="progress-stacked">
                            <div class="progress won" role="progressbar" aria-label="Segment one" aria-valuenow="${winPercentage}" aria-valuemin="0" aria-valuemax="100" style="width: ${winPercentage}%">
                                <div class="progress-bar wonBar ${winColor}">Won - ${Won}</div>
                            </div>
                            <div class="progress" role="progressbar" aria-label="Segment two" aria-valuenow="${leadPercentage}" aria-valuemin="0" aria-valuemax="100" style="width: ${leadPercentage}%">
                                <div class="progress-bar leadBg">Lead - ${Lead}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
  }

  // Fetch data initially and then every 5000ms
  setData();
  setInterval(setData, 1500);

  // States Trends
  var data; // Define data in the global scope

  // Function to fetch data from Google Sheet web app
  function fetchData() {
    fetch(
      "https://script.google.com/macros/s/AKfycbxBueMADrNHu1dx7XlbXAgrX8H7Cogx8TbRivnt5CJavmfn8t-0JGUv6Ox3syKafqI/exec"
    )
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData) {
          data = responseData; // Assign fetched data to the global variable
          populateDropdown(data.content.lokShabha);
        } else {
          console.error("Error: Data is missing lokShabha property");
        }
      })
      .catch((error) => console.error("Error:", error));
  }

  // Function to populate the state dropdown
  function populateDropdown(data) {
    var states = [...new Set(data.map((item) => item.State))];
    var dropdown = document.getElementById("state");
    states.forEach((state) => {
      var option = document.createElement("option");
      option.text = state;
      dropdown.add(option);
    });
    updatePartyStatus(); // Initial update based on the first state
  }

  function updatePartyStatus() {
    var selectedState = $("#state").val();
    var stateData = data.content.lokShabha.filter(
      (item) => item.State === selectedState
    );
    var partyStatusDiv = document.getElementById("party");
    partyStatusDiv.innerHTML = ""; // Clear previous content

    stateData.forEach((item) => {
      // Create a div to hold each party's status
      var partyDiv = document.createElement("div");
      partyDiv.classList.add("row", "borderBtm", "align-items-baseline");

      // Create a column for party name
      var partyNameCol = document.createElement("div");
      partyNameCol.classList.add("col-md-5", "col-5", "party-name"); // Added "col-6" here
      var partyName = document.createElement("p");
      partyName.innerText = item.Party;
      partyNameCol.appendChild(partyName);

      // Create a column for status icon
      var statusCol = document.createElement("div");
      statusCol.classList.add("col-md-6", "col-7", "status-icon"); // Added "col-6" here
      var statusImg = document.createElement("img");
      statusImg.classList.add("img-fluid");
      if (item.Status.trim().toUpperCase() === "LEADING") {
        statusImg.src = "assets/images/leading.png";
        statusImg.alt = "Leading Icon";
      } else {
        statusImg.src = "assets/images/trailing.png";
        statusImg.alt = "Trailing Icon";
      }
      statusCol.appendChild(statusImg);

      // Append both columns to the party div
      partyDiv.appendChild(partyNameCol);
      partyDiv.appendChild(statusCol);

      // Append the party div to the main container
      partyStatusDiv.appendChild(partyDiv);
    });
  }

  // Event listener for state dropdown change
  $("#state").change(function () {
    updatePartyStatus(); // Call the function without passing data variable
  });

  // Fetch data and populate dropdown on page load
  fetchData();

  $(".icon_pos").on("click", function () {
    $(".form-select").click();
  });

  // States Trends

  //  Candidate
  // Fetching candidate data
  // Fetching candidate data
  fetch(
    "https://script.google.com/macros/s/AKfycbyBcDPWcvvPreCBGukD8LvHa1Rq90anWGYH_ciSOaLZEAFNHGLv5yKq91cGhMq1a-0/exec"
  )
    .then((res) => res.json())
    .then((data) => {
      const candidates = data.content.lokShabha;
      initSlideshow(candidates); // Pass candidates data to initSlideshow function
    })
    .catch((error) => {
      console.error("Error fetching candidate data:", error);
    });

  // Function to initialize the slideshow
  function initSlideshow(candidates) {
    var slideshowContainer = document.getElementById("slideshow-container");
    var slideshowContainer1 = document.getElementById("slideshow-container1");

    candidates.forEach(function (candidate, index) {
      // Create a new div for each candidate
      var candidateDiv = document.createElement("div");
      candidateDiv.className = "candidate-slide";
      candidateDiv.innerHTML = `
      <div class="row g-3 align-items-center">
        <div class="col-4">
          <div class="candidateImg">
            <img src="assets/images/hp-keycandidates/${candidate.Image}.png" class="img-fluid" alt="" srcset="" />
          </div>
        </div>
        <div class="col-8">
          <div class="candidateName">
            <h5>${candidate.CandidateName}</h5>
            <p>${candidate.Party} -<span>${candidate.Constituency} </span></p>
          </div>
          <div>
            <img src="assets/images/${candidate.Status}.png" class="img-fluid customStateImg2"/>
          </div>
        </div>
      </div>
    `;
      var candidateDiv1 = document.createElement("div");
      candidateDiv1.className = "candidate-slide1";
      candidateDiv1.innerHTML = `
      <div class="row g-3 align-items-center">
        <div class="col-4">
          <div class="candidateImg">
            <img src="assets/images/hp-keycandidates/${candidate.Image}.png" class="img-fluid" alt="" srcset="" />
          </div>
        </div>
        <div class="col-8">
          <div class="candidateName">
            <h5>${candidate.CandidateName}</h5>
            <p>${candidate.Party} -<span>${candidate.Constituency} </span></p>
          </div>
          <div>
            <img src="assets/images/${candidate.Status}.png" class="img-fluid customStateImg2"/>
          </div>
        </div>
      </div>
    `;

      // Add the candidate div to the appropriate slideshow container based on index
      if (index % 2 === 0) {
        slideshowContainer.appendChild(candidateDiv); // Add to slideshowContainer for even indices
      } else {
        slideshowContainer1.appendChild(candidateDiv1); // Add to slideshowContainer1 for odd indices
      }
    });

    // Start the slideshow
    startSlideshow();
  }

  // Function to start the slideshow
  function startSlideshow() {
    var slides = document.querySelectorAll(".candidate-slide");
    var slidesOne = document.querySelectorAll(".candidate-slide1");
    var currentIndex = 0;
    var currentIndex1 = 0;

    setInterval(function () {
      slides[currentIndex].style.opacity = 0;
      currentIndex = (currentIndex + 1) % slides.length;
      slides[currentIndex].style.opacity = 1;
    }, 5000); // Change slide every 5 seconds (5000 milliseconds)

    setInterval(function () {
      slidesOne[currentIndex1].style.opacity = 0;
      currentIndex1 = (currentIndex1 + 1) % slidesOne.length;
      slidesOne[currentIndex1].style.opacity = 1;
    }, 5000); // Change slide every 5 seconds (5000 milliseconds)
  }

  //  Candidate
});
