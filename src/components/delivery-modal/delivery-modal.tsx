import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { fetchUserAddresses, createUserAddress } from "@/services/api.service";
import "./delivery-modal.scss";

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { phone: string; address: string; location?: { lat: number; lng: number } }) => void;
}

export function DeliveryModal({ isOpen, onClose, onConfirm }: DeliveryModalProps) {
  const { language } = useI18n();
  const [step, setStep] = useState<"phone" | "map">("phone");
  const [phone, setPhone] = useState("+998 ");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const placemarkRef = useRef<any>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchUserAddresses().catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (isOpen && tg) {
      tg.expand();
      tg.MainButton.show();
      
      const onMainClick = async () => {
        if (step === "phone") {
            if (phone.length >= 13) setStep("map");
        } else {
            if (address && !isResolvingAddress) {
                try {
                  await createUserAddress({
                    address_name: address,
                    latitude: String(coords?.[0] || ""),
                    longitude: String(coords?.[1] || "")
                  });
                } catch (e) {
                  console.error("Failed to save address:", e);
                }

                onConfirm({ 
                    phone, 
                    address: comment ? `${address} | ${comment}` : address,
                    location: coords ? { lat: coords[0], lng: coords[1] } : undefined 
                });
            }
        }
      };

      tg.MainButton.onClick(onMainClick);
      
      return () => {
        tg.MainButton.offClick(onMainClick);
        tg.MainButton.hide();
      };
    }
  }, [isOpen, step, phone, address, coords, comment, isResolvingAddress, onConfirm]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg && isOpen) {
      if (step === "phone") {
        tg.MainButton.text = language === "uz" ? "KEYINGI" : "ДАЛЕЕ";
        if (phone.length < 13) {
          tg.MainButton.disable();
          tg.MainButton.setParams({ color: "#999999" });
        } else {
          tg.MainButton.enable();
          tg.MainButton.setParams({ color: tg.themeParams.button_color || "#F54927" });
        }
      } else {
        tg.MainButton.text = language === "uz" ? "TASDIQLASH" : "ПОДТВЕРДИТЬ";
        if (!address || isResolvingAddress) {
          tg.MainButton.disable();
          tg.MainButton.setParams({ color: "#999999" });
        } else {
          tg.MainButton.enable();
          tg.MainButton.setParams({ color: tg.themeParams.button_color || "#F54927" });
        }
      }
    }
  }, [isOpen, step, phone, address, isResolvingAddress, language]);

  useEffect(() => {
    let map: any = null;

    if (isOpen && step === "map" && mapRef.current) {
        // @ts-ignore
        const ymaps = window.ymaps;
        if (ymaps) {
            ymaps.ready(() => {
                try {
                    if (mapInstance.current) {
                        mapInstance.current.destroy();
                    }
                    
                    map = new ymaps.Map(mapRef.current, {
                        center: [41.311081, 69.240562], // Tashkent default
                        zoom: 12,
                        controls: ['zoomControl', 'geolocationControl']
                    });
                    mapInstance.current = map;

                    const placemark = new ymaps.Placemark(map.getCenter(), {}, {
                        preset: 'islands#redDotIconWithCaption',
                        draggable: true
                    });

                    placemarkRef.current = placemark;
                    map.geoObjects.add(placemark);

                    const updateAddress = (newCoords: [number, number]) => {
                        setCoords(newCoords);
                        setIsResolvingAddress(true);
                        const coordsString = `${newCoords[0]},${newCoords[1]}`;
                        // @ts-ignore
                        ymaps.geocode(coordsString).then((res: any) => {
                            const firstGeoObject = res.geoObjects.get(0);
                            if (firstGeoObject) {
                                const fullAddr = firstGeoObject.getAddressLine();
                                setAddress(fullAddr);
                            } else {
                                setAddress(coordsString);
                            }
                        }).finally(() => setIsResolvingAddress(false));
                    };

                    updateAddress(map.getCenter());

                    map.events.add('click', (e: any) => {
                        const clickCoords = e.get('coords');
                        placemark.geometry.setCoordinates(clickCoords);
                        updateAddress(clickCoords);
                    });

                    placemark.events.add('dragend', () => {
                       const dragCoords = placemark.geometry.getCoordinates();
                       updateAddress(dragCoords);
                    });
                } catch (e: any) {
                    console.error("Map creation error:", e);
                }
            });
        }
    }

    return () => {
        if (mapInstance.current) {
            mapInstance.current.destroy();
            mapInstance.current = null;
        }
    };
  }, [isOpen, step]);

  if (!isOpen) return null;

  return (
    <div className="delivery-modal-overlay" onClick={onClose}>
      <div className="delivery-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delivery-modal__header">
           <h2 className="delivery-modal__title">
              {step === "phone" ? (language === "uz" ? "Telefon raqamingiz" : "Ваш номер телефона") : (language === "uz" ? "Manzilni tanlang" : "Выберите адрес")}
           </h2>
           <button className="delivery-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="delivery-modal__content">
           {step === "phone" ? (
             <div className="delivery-modal__phone-wrap">
               <input 
                  type="tel"
                  className="delivery-modal__input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
               />
             </div>
           ) : (
             <div className="delivery-modal__map-wrap">
               <div className="delivery-modal__map-container">
                  <div ref={mapRef} className="delivery-modal__map" />
               </div>
                <div className="delivery-modal__address">
                   <p className="delivery-modal__address-text">
                      {isResolvingAddress ? "..." : (address || "...")}
                   </p>
                </div>
                <div className="delivery-modal__comment-field">
                    <label>{language === "uz" ? "Izoh (ixtiyoriy):" : "Комментарий (опционально):"}</label>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={language === "uz" ? "Podyezd, qavat..." : "Подъезд, этаж..."}
                    />
                </div>
             </div>
           )}
        </div>

        <div className="delivery-modal__footer" style={{ display: 'none' }}>
           {/* Managed via Telegram MainButton */}
        </div>
      </div>
    </div>
  );
}
