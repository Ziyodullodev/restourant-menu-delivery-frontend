import React, { useEffect, useState } from "react";
import { Joyride, STATUS, Step } from "react-joyride";

const QuestionBeacon = React.forwardRef<HTMLButtonElement, any>((props, ref) => {
  return (
    <>
      <style>{`
        @keyframes custom-joyride-pulse {
          0% { box-shadow: 0 0 0 0 rgba(245, 73, 39, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(245, 73, 39, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 73, 39, 0); }
        }
      `}</style>
      <button
        {...props}
        ref={ref}
        style={{
          width: 28,
          height: 28,
          backgroundColor: "#F54927",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          fontSize: 16,
          cursor: "pointer",
          border: "2px solid white",
          outline: "none",
          padding: 0,
          animation: "custom-joyride-pulse 2s infinite",
        }}
      >
        ?
      </button>
    </>
  );
});
QuestionBeacon.displayName = "QuestionBeacon";

export function OnboardingTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("has_seen_tour");
    if (!hasSeenTour) {
      // Delaying a bit to allow the DOM to render components like products
      const timer = setTimeout(() => {
        setRun(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideEvent = (data: any) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem("has_seen_tour", "true");
      setRun(false);
    }
  };

  const steps: Step[] = [
    {
      target: ".tour-order-type",
      content: "Buyurtma turini ushbu yerdan o'zgartirishingiz mumkin, masalan olib ketishni tanlang.",
      title: "Buyurtma turi",
    },
    {
      target: ".tour-lang-switcher",
      content: "Sayt tilini rus yoki o'zbek tiliga o'zgartirishingiz mumkin.",
      title: "Tilni o'zgartirish",
    },
    {
      target: ".tour-add-cart",
      content: "Yoqtirgan mahsulotingizni shu tugma orqali savatga saqlang.",
      title: "Savatga saqlash",
    },
    {
      target: ".tour-cart-tab",
      content: "Buyurtmani rasmiylashtirish uchun savatga o'ting.",
      title: "Savat",
      placement: "top",
    },
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      scrollToFirstStep={true}
      onEvent={handleJoyrideEvent}
      beaconComponent={QuestionBeacon}
      options={{
        primaryColor: "#F54927",
        zIndex: 10000,
        buttons: ["back", "close", "primary", "skip"],
        showProgress: true,
      }}
      locale={{
        back: "Orqaga",
        close: "Yopish",
        last: "Tugatish",
        next: "Keyingisi",
        skip: "O'tkazib yuborish",
      }}
    />
  );
}
