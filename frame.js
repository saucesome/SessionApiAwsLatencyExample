import { createInstance, TerminalEvent } from "@fra.me/terminal-factory";
import { AwsRegionNames, FrameAccountConfigs, devToken } from "./config";
import pingRegion from "./je-latency";

function addNotification(message) {
  console.info(message);
  const sessionNotification = document.querySelector("#session-notification");
  sessionNotification.innerHTML = message;
}

document.addEventListener("DOMContentLoaded", async () => {
  addNotification("frame.js loaded");
  const startButton = document.querySelector("#start-button");
  let selectedLocation = "";
  let terminal;

  // Loads a Frame terminal instance based on a passed account config
  const loadFrame = async (accountConfig) => {
    addNotification("Configuring options");
    const sessionOptions = {
      serviceUrl: "https://cpanel-backend-prod.frame.nutanix.com/api/graphql",
      terminalConfigId: accountConfig.terminalConfigId,
      token: devToken,
    };

    try {
      addNotification("Instantiating Frame", sessionOptions);
      const terminalInstance = await createInstance(sessionOptions);
      addNotification("Frame Session API is ready to go.");
      // Bind to events here.
      // Docs: https://docs.frame.nutanix.com/frame-apis/session-api.html#session-workflow-events-terminal-events

      terminalInstance.bind(TerminalEvent.SESSION_STARTING, () => {
        startButton.disabled = true;
        startButton.textContent = "Connecting...";
        addNotification("Session is starting.");
      });

      terminalInstance.bind(TerminalEvent.SESSION_STARTED, () => {
        startButton.disabled = true;
        startButton.textContent = "Connected.";
        addNotification("Session connected.");
      });

      terminalInstance.bind(TerminalEvent.SESSION_RESUMING, () => {
        startButton.disabled = true;
        startButton.textContent = "Resuming.";
        addNotification("Resuming a session.");
      });

      terminalInstance.bind(TerminalEvent.SESSION_RESUMED, () => {
        startButton.disabled = true;
        startButton.textContent = "Connected.";
        addNotification("Session connected.");
      });

      terminalInstance.bind(TerminalEvent.SESSION_DISCONNECTED, () => {
        startButton.disabled = false;
        startButton.textContent = "Reconnect";
        addNotification(
          "Disconnected. You're able to resume your session unless a configured timeout is reached."
        );
      });

      terminalInstance.bind(TerminalEvent.SESSION_CLOSED, () => {
        startButton.disabled = false;
        startButton.textContent = "Connect";
        addNotification("Session closed.");
      });

      return terminalInstance;
    } catch (error) {
      addNotification(error);
    }
  };

  // This starts or resumes a session.
  const startSession = async (appId) => {
    if (!terminal) {
      console.error("Terminal not loaded.");
    }
    try {
      const session = await terminal.getOpenSession();
      if (session) {
        await terminal.resume(session.id);
        startButton.textContent = "Resuming";
      } else {
        await terminal.start({
          appId: appId || undefined,
          userData: undefined,
        });
      }
    } catch (error) {
      addNotification(error);

      // handle errors starting (for example, retry after a short delay)
    }
  };

  // This is the starting point -- this function runs after the page is loaded
  const startFrame = async () => {
    let latencyResults = [];

    const handleLatencyResults = (result) => {
      addNotification(`${result.region} - ${result.latency}`);
      const latencyStatsContainer = document.querySelector("#latency-stats");

      latencyResults.push(result);
      latencyStatsContainer.innerHTML += `<span>${result.region} - ${result.latency}ms</span><br/>`;
    };

    handleLatencyResults(await pingRegion(AwsRegionNames.VIRGINIA));
    handleLatencyResults(await pingRegion(AwsRegionNames.CALIFORNIA));
    handleLatencyResults(await pingRegion(AwsRegionNames.OHIO));
    handleLatencyResults(await pingRegion(AwsRegionNames.MUMBAI));

    addNotification(latencyResults);

    const regionWithLowestLatency = latencyResults.reduce((min, result) =>
      min.latency < result.latency ? min : result
    );

    // update latency div with best result.
    document.querySelector(
      "#latency-stats"
    ).innerHTML += `<hr/><span><strong>Best result: </strong>${regionWithLowestLatency.region} - ${regionWithLowestLatency.latency}ms</span><br/>`;

    addNotification(
      `Region with the lowest latency: ${regionWithLowestLatency.region} with ${regionWithLowestLatency.latency}ms`
    );

    const selectedLocationInput = document.querySelector("#account-region");

    if (regionWithLowestLatency.region) {
      selectedLocationInput.value = regionWithLowestLatency.region;
      selectedLocation = regionWithLowestLatency.region;
      const account = getEnumKeyByEnumValue(
        AwsRegionNames,
        regionWithLowestLatency.region
      );
      terminal = await loadFrame(FrameAccountConfigs[account]);
    }

    selectedLocationInput.addEventListener("change", async (event) => {
      console.l;
      selectedLocation = event.target.value;
      const account = getEnumKeyByEnumValue(AwsRegionNames, event.target.value);
      terminal = await loadFrame(FrameAccountConfigs[account]);
    });

    startButton.disabled = false;
    startButton.textContent = "Connect";

    startButton.addEventListener("click", async () => {
      addNotification("Requesting session for ", selectedLocation);
      switch (selectedLocation) {
        case AwsRegionNames.CALIFORNIA:
          await startSession(FrameAccountConfigs["CALIFORNIA"]?.applicationId);
          break;

        case AwsRegionNames.NOVA:
          await startSession(FrameAccountConfigs["VIRGINIA"]?.applicationId);
          break;

        case AwsRegionNames.OHIO:
          await startSession(FrameAccountConfigs["OHIO"]?.applicationId);
          break;

        case AwsRegionNames.MUMBAI:
          await startSession(FrameAccountConfigs["MUMBAI"]?.applicationId);
          break;
      }
    });
  };

  function getEnumKeyByEnumValue(myEnum, enumValue) {
    let keys = Object.keys(myEnum).filter((x) => myEnum[x] == enumValue);
    return keys.length > 0 ? keys[0] : null;
  }

  startFrame();
});
