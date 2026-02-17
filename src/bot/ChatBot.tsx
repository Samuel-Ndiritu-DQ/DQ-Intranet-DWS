"use client";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    voiceflow?: {
      chat?: {
        load: (opts: any) => Promise<void>;
        close?: () => void;
        interact?: (payload: any) => void;
        destroy?: () => void;
      };
    };
  }
}

const VOICEFLOW_SCRIPT_ID = "voiceflow-script";
const VOICEFLOW_BUNDLE_URL = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
const EVENT_MAP: Record<string, string> = {
  "/financial-marketplace": "Navigation_to_Finance_Marketplace",
  "/non-financial-marketplace": "Navigation_To_The_Non_Finance_Marketplace",
};

const buildStylesheet = () =>
  "data:text/css;base64," +
  btoa(`
    .vfrc-launcher {
      background-color: #ffffff !important;
      color: #ffffff !important;
      width: 60px !important;
      height: 60px !important;
      border-radius: 50% !important;
    }
    .vfrc-launcher:hover {
      background-color: #ffffff !important;
    }
  `);

const buildConfig = (pathname: string) => {
  const stylesheet = buildStylesheet();
  const sharedConfig = {
    verify: { projectID: "6849bea9894655c0d600d259" },
    url: "https://general-runtime.voiceflow.com",
    versionID: "production",
    assistant: {
      stylesheet,
    },
  };

  const eventName = EVENT_MAP[pathname] ?? null;

  const config =
    eventName === null
      ? sharedConfig
      : {
          ...sharedConfig,
          voice: { url: "https://runtime-api.voiceflow.com" },
          assistant: { ...sharedConfig.assistant, persistence: "sessionStorage" },
        };

  return { config, eventName };
};

const triggerNavigationEvent = (eventName: string) => {
  globalThis.window.voiceflow?.chat?.interact?.({
    type: "event",
    payload: { event: { name: eventName } },
  });
};

const scheduleNavigationEvent = (eventName: string) => {
  globalThis.window.setTimeout(() => {
    triggerNavigationEvent(eventName);
  }, 500);
};

const triggerLaunchEvent = () => {
  // User data should be retrieved from authentication context or storage
  const storage = {
    name: "User Name",
    stage: "Stage 1",
    sector: "Finance",
  };

  globalThis.window.voiceflow?.chat?.interact?.({
    type: "launch",
    payload: {
      user_name: storage.name,
      user_stage: storage.stage,
      user_sector: storage.sector,
    },
  });
};

const handleVoiceflowLoad = async (pathname: string) => {
  const { config, eventName } = buildConfig(pathname);
  await globalThis.window.voiceflow?.chat?.load(config);

  if (eventName) {
    scheduleNavigationEvent(eventName);
  }

  triggerLaunchEvent();
};

const removeExistingVoiceflow = (isAlreadyInitialized: boolean) => {
  if (isAlreadyInitialized && globalThis.window.voiceflow?.chat) {
    globalThis.window.voiceflow.chat.destroy?.();
    globalThis.window.voiceflow.chat.close?.();
  }

  const existingScript = document.getElementById(VOICEFLOW_SCRIPT_ID);
  if (existingScript) {
    existingScript.remove();
  }
};

const loadVoiceflowScript = () =>
  new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = VOICEFLOW_SCRIPT_ID;
    script.src = VOICEFLOW_BUNDLE_URL;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Voiceflow script'));
    document.body.appendChild(script);
  });

const ChatBot = () => {
  const pathname = globalThis.window.location.pathname;
  const isInitialized = useRef(false);

  useEffect(() => {
    let isCancelled = false;

    const initializeVoiceflow = async () => {
      removeExistingVoiceflow(isInitialized.current);

      try {
        await loadVoiceflowScript();
        if (isCancelled) return;

        await handleVoiceflowLoad(pathname);
        isInitialized.current = true;
      } catch (error) {
        console.error("Failed to load Voiceflow:", error);
      }
    };

    initializeVoiceflow();

    return () => {
      isCancelled = true;
      if (globalThis.window.voiceflow?.chat) {
        globalThis.window.voiceflow.chat.close?.();
      }
    };
  }, [pathname]);

  return null;
};

export default ChatBot;
