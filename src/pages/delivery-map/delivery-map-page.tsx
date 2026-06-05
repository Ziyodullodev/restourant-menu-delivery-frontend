import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "@/contexts/i18n-context";
import { useCart } from "@/contexts/cart-context";
import { createUserAddress } from "@/services/api.service";
import "./delivery-map-page.scss";

interface YMapsPlacemark {
  geometry: {
    setCoordinates(coords: [number, number]): void;
    getCoordinates(): [number, number];
  };
  events: { add(event: string, handler: () => void): void };
}

interface YMapsMap {
  destroy(): void;
  getCenter(): [number, number];
  setCenter(coords: [number, number], zoom?: number): void;
  geoObjects: { add(obj: YMapsPlacemark): void };
  events: { add(event: string, handler: (e: { get(key: string): [number, number] }) => void): void };
}

interface LocationState {
  phone?: string;
  comment?: string;
}

export function DeliveryMapPage(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useI18n();
  const { placeOrder } = useCart();

  const state = (location.state as LocationState) || {};
  const phone = state.phone || "";
  const comment = state.comment || "";

  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState("");
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<YMapsMap | null>(null);
  const placemarkRef = useRef<YMapsPlacemark | null>(null);
  const updateAddressRef = useRef<((coords: [number, number]) => void) | null>(null);

  const t = {
    title: language === "ru" ? "Выберите адрес" : "Manzilni tanlang",
    confirm: language === "ru" ? "Подтвердить" : "Tasdiqlash",
    error: language === "ru" ? "Произошла ошибка" : "Xatolik yuz berdi",
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // @ts-expect-error — Yandex Maps global, no official TS types
    const ymaps = window.ymaps;
    if (!ymaps) return;

    ymaps.ready(() => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
      }

      const map = new ymaps.Map(mapRef.current, {
        center: [41.311081, 69.240562],
        zoom: 13,
        controls: ["zoomControl"],
      });
      const activeMap = map as YMapsMap;
      mapInstance.current = activeMap;

      const placemark = new ymaps.Placemark(
        activeMap.getCenter(),
        {},
        { preset: "islands#redDotIconWithCaption", draggable: true }
      );
      placemarkRef.current = placemark;
      activeMap.geoObjects.add(placemark);

      const updateAddress = (newCoords: [number, number]) => {
        setCoords(newCoords);
        setIsResolvingAddress(true);
        ymaps.geocode(newCoords, { results: 1 }).then(
          (res: { geoObjects: { get(i: number): { getAddressLine(): string; properties: { get(key: string): string } } | null } }) => {
            const obj = res.geoObjects.get(0);
            if (obj) {
              const name = obj.properties.get("name");
              const desc = obj.properties.get("description");
              setAddress(desc ? `${name}, ${desc}` : name || obj.getAddressLine());
            }
            setIsResolvingAddress(false);
          },
          () => { setIsResolvingAddress(false); }
        );
      };

      updateAddressRef.current = updateAddress;
      updateAddress(activeMap.getCenter());

      activeMap.events.add("click", (e: { get(key: string): [number, number] }) => {
        const clickCoords = e.get("coords");
        placemark.geometry.setCoordinates(clickCoords);
        updateAddress(clickCoords);
      });

      placemark.events.add("dragend", () => {
        updateAddress(placemark.geometry.getCoordinates());
      });

    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, []);

  const handleMyLocation = () => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      const newCoords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
      mapInstance.current?.setCenter(newCoords, 16);
      placemarkRef.current?.geometry.setCoordinates(newCoords);
      updateAddressRef.current?.(newCoords);
    });
  };

  const handleConfirm = async () => {
    if (!coords || isResolvingAddress) return;
    setIsLoading(true);
    try {
      // Manzilni saqlash va UUID ni olish
      let savedAddressId: string | undefined;
      try {
        const addressName = (address || `${coords[0]}, ${coords[1]}`).slice(0, 30);
        const saved = await createUserAddress({
          address_name: addressName,
          latitude: String(coords[0]),
          longitude: String(coords[1]),
        });
        savedAddressId = saved.id;
      } catch {
        // Manzil saqlanmasa ham buyurtma davom etadi
      }

      await placeOrder({
        phone,
        address: savedAddressId,
        comment: comment || undefined,
      });
      navigate("/orders", { replace: true });
    } catch {
      alert(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="delivery-map-page">
      <div className="delivery-map-page__header">
        <button
          className="delivery-map-page__back"
          onClick={() => navigate("/delivery/contact", { state: { phone, comment } })}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="delivery-map-page__title">{t.title}</h1>
        <div style={{ width: 32 }} />
      </div>

      <div className="delivery-map-page__map-wrap">
        <div ref={mapRef} className="delivery-map-page__map" />

        <button className="delivery-map-page__location-btn" onClick={handleMyLocation} title="My location">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="4.5" fill="#F54927" />
            <circle cx="12" cy="12" r="2.5" fill="white" />
            <line x1="12" y1="1.5" x2="12" y2="6" stroke="#F54927" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="12" y1="18" x2="12" y2="22.5" stroke="#F54927" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="1.5" y1="12" x2="6" y2="12" stroke="#F54927" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="18" y1="12" x2="22.5" y2="12" stroke="#F54927" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>

      </div>

      <div className="delivery-map-page__bottom">
        <button
          className="delivery-map-page__confirm-btn"
          onClick={handleConfirm}
          disabled={!coords || isResolvingAddress || isLoading}
        >
          {isLoading ? "..." : t.confirm}
        </button>
      </div>
    </div>
  );
}
