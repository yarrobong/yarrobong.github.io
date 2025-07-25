import React, { useState, useEffect } from "react";
import "./App.css";

// Выносим статичные данные за компонент
const tradeInPrices = {
  "Quest 2": { "64": 13500, "128": 15500, "256": 16500 },
  "Pico 4": { "128": 16500, "256": 18000 },
};

const newDevicePrices = {
  "Quest 3s": { "128": 24200, "256": 31490 },
  "Quest 3": { "512": 42500 },
  "Pico 4 Ultra": { "256": 39500 },
};

const oldModels = Object.keys(tradeInPrices);
const newModels = Object.keys(newDevicePrices);

const App = () => {
  const [mountOption, setMountOption] = useState("BOBOVR S3 PRO");
  const [oldDevices, setOldDevices] = useState([
    {
      model: oldModels[0],
      memory: "128",
      quantity: 1,
      battery: true,
      mount: true,
      box: true,
      condition: "отличное",
    },
  ]);
  const [newDevice, setNewDevice] = useState({
    model: newModels[0],
    memory: "128",
    quantity: 1,
  });
  const [result, setResult] = useState(null);

  // Эффект: при смене модели — подставляем первую доступную память
  useEffect(() => {
    const memories = Object.keys(newDevicePrices[newDevice.model] || {});
    if (memories.length > 0 && !memories.includes(newDevice.memory)) {
      setNewDevice((prev) => ({ ...prev, memory: memories[0] }));
    }
  }, [newDevice.model, newDevice.memory]); // ✅ Теперь newDevicePrices не нужен в зависимостях, т.к. вне компонента

  const getMountPrice = () => {
    switch (mountOption) {
      case "BOBOVR S3 PRO": return 6990;
      case "BOBOVR M3 PRO": return 4490;
      case "BOBOVR P4U": return 6990;
      case "BOBOVR P4S": return 5490;
      case "Без крепления": return 0;
      default: return 0;
    }
  };

  const addOldDevice = () => {
    setOldDevices([
      ...oldDevices,
      {
        model: oldModels[0],
        memory: "128",
        quantity: 1,
        battery: true,
        mount: true,
        box: true,
        condition: "отличное",
      },
    ]);
  };

  const removeOldDevice = (index) => {
    if (oldDevices.length > 1) {
      setOldDevices(oldDevices.filter((_, i) => i !== index));
    }
  };

  const updateOldDevice = (index, field, value) => {
    const updated = [...oldDevices];
    updated[index][field] = value;
    setOldDevices(updated);
  };

  const updateNewDevice = (field, value) => {
    setNewDevice((prev) => ({ ...prev, [field]: value }));
  };

  const incrementQuantity = (index) => {
    const updated = [...oldDevices];
    updated[index].quantity += 1;
    setOldDevices(updated);
  };

  const decrementQuantity = (index) => {
    const updated = [...oldDevices];
    if (updated[index].quantity > 1) {
      updated[index].quantity -= 1;
      setOldDevices(updated);
    }
  };

  const incrementNewQuantity = () => {
    setNewDevice((prev) => ({ ...prev, quantity: prev.quantity + 1 }));
  };

  const decrementNewQuantity = () => {
    setNewDevice((prev) => ({
      ...prev,
      quantity: prev.quantity > 1 ? prev.quantity - 1 : 1,
    }));
  };

  const calculateDeviceValue = (device) => {
    const basePrice = tradeInPrices[device.model]?.[device.memory] || 0;
    const bonuses = (device.battery ? 500 : 0) +
                    (device.mount ? 500 : 0) +
                    (device.box ? 500 : 0);
    let conditionMultiplier = 1;
    switch (device.condition) {
      case "хорошее":
        conditionMultiplier = 0.9;
        break;
      case "удовлетворительное":
        conditionMultiplier = 0.7;
        break;
      default:
        conditionMultiplier = 1;
    }
    return Math.round((basePrice + bonuses) * conditionMultiplier);
  };

  const calculateTotalTradeIn = () => {
    return oldDevices.reduce((total, device) => {
      return total + calculateDeviceValue(device) * device.quantity;
    }, 0);
  };

  const calculateNewDevicesCost = () => {
    return (newDevicePrices[newDevice.model]?.[newDevice.memory] || 0) * newDevice.quantity;
  };

  const getDeviceDescription = (device) => {
    const included = [];
    if (device.battery) included.push("аккумулятор");
    if (device.mount) included.push("крепление");
    if (device.box) included.push("коробка");
    return `${device.model} ${device.memory}ГБ (${included.join(", ")})`;
  };

  const calculate = () => {
    const totalTradeIn = calculateTotalTradeIn();
    const deviceCost = calculateNewDevicesCost();
    const mountCost = getMountPrice() * newDevice.quantity;
    const newDevicesTotal = deviceCost + mountCost;
    const balance = newDevicesTotal - totalTradeIn;

    const devicesList = oldDevices.map((device) => ({
      description: getDeviceDescription(device),
      quantity: device.quantity,
      totalValue: calculateDeviceValue(device) * device.quantity,
      condition: device.condition,
    }));

    const mountDescription = getMountPrice() > 0 ? `${mountOption} × ${newDevice.quantity}` : null;

    setResult({
      devicesList,
      totalTradeIn,
      deviceCost,
      mountCost,
      newDevicesTotal,
      balance,
      newDeviceDesc: `${newDevice.model} ${newDevice.memory}ГБ`,
      newDeviceQuantity: newDevice.quantity,
      mountDescription,
    });
  };

  const previewNewDevicesTotal = () => {
    const deviceCost = (newDevicePrices[newDevice.model]?.[newDevice.memory] || 0) * newDevice.quantity;
    const mountCost = getMountPrice() * newDevice.quantity;
    return deviceCost + mountCost;
  };

  return (
    <div className="background-lights">
      <div className="app-container">
        <h1>BIZON<br />Калькулятор трейд-ин VR-оборудования</h1>

        <section className="section">
          <button onClick={addOldDevice} className="btn">
            + Добавить конфигурацию
          </button>
          {oldDevices.map((device, i) => (
            <div key={i} className="device-card">
              <h2>Сдаете</h2>
              <div className="device-grid">
                <div className="device-left">
                  <label>
                    Модель:
                    <select
                      value={device.model}
                      onChange={(e) => updateOldDevice(i, "model", e.target.value)}
                    >
                      {oldModels.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Объём памяти:
                    <select
                      value={device.memory}
                      onChange={(e) => updateOldDevice(i, "memory", e.target.value)}
                    >
                      {Object.keys(tradeInPrices[device.model] || {}).map((mem) => (
                        <option key={mem} value={mem}>
                          {mem} ГБ
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="quantity-label">
                    Количество:
                    <button
                      type="button"
                      onClick={() => decrementQuantity(i)}
                      disabled={device.quantity <= 1}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={device.quantity}
                      onChange={(e) => {
                        const value = e.target.valueAsNumber;
                        if (!isNaN(value) && value >= 1) {
                          updateOldDevice(i, "quantity", value);
                        }
                      }}
                      className="quantity-input"
                      aria-label="Количество устройства"
                    />
                    <button type="button" onClick={() => incrementQuantity(i)}>+</button>
                  </label>
                </div>
                <div className="device-right">
                  <label>
                    <input
                      type="checkbox"
                      checked={device.battery}
                      onChange={(e) =>
                        updateOldDevice(i, "battery", e.target.checked)
                      }
                    />
                    Аккумулятор
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={device.mount}
                      onChange={(e) =>
                        updateOldDevice(i, "mount", e.target.checked)
                      }
                    />
                    Крепление
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={device.box}
                      onChange={(e) =>
                        updateOldDevice(i, "box", e.target.checked)
                      }
                    />
                    Коробка
                  </label>
                  <label>
                    Состояние:
                    <select
                      className="custom-select"
                      value={device.condition}
                      onChange={(e) =>
                        updateOldDevice(i, "condition", e.target.value)
                      }
                    >
                      <option value="отличное">Отличное (100%)</option>
                      <option value="хорошее">Хорошее (90%)</option>
                      <option value="удовлетворительное">
                        Удовлетворительное (70%)
                      </option>
                    </select>
                  </label>
                  <div className="price-display">
                    Итого: {(calculateDeviceValue(device) * device.quantity).toLocaleString()} ₽
                  </div>
                  {oldDevices.length > 1 && (
                    <button
                      className="btn-delete"
                      onClick={() => removeOldDevice(i)}
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="new-device">
          <h2>Получаете</h2>
          <div className="new-device-grid">
            <div className="new-device-form">
              <label>
                Модель:
                <select
                  value={newDevice.model}
                  onChange={(e) => updateNewDevice("model", e.target.value)}
                >
                  {newModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Объём памяти:
                <select
                  value={newDevice.memory}
                  onChange={(e) => updateNewDevice("memory", e.target.value)}
                >
                  {Object.keys(newDevicePrices[newDevice.model] || {}).map((mem) => (
                    <option key={mem} value={mem}>
                      {mem} ГБ
                    </option>
                  ))}
                </select>
              </label>
              <label className="quantity-label">
                Количество:
                <button
                  type="button"
                  onClick={decrementNewQuantity}
                  disabled={newDevice.quantity <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={newDevice.quantity}
                  onChange={(e) => {
                    const value = e.target.valueAsNumber;
                    if (!isNaN(value) && value >= 1) {
                      setNewDevice((prev) => ({ ...prev, quantity: value }));
                    }
                  }}
                  className="quantity-input"
                  aria-label="Количество устройства"
                />
                <button type="button" onClick={incrementNewQuantity}>+</button>
              </label>
            </div>

            <div className="new-device-accessories">
              {newDevice.model === "Quest 3" || newDevice.model === "Quest 3s" ? (
                <label>
                  Крепление:
                  <select
                    value={mountOption}
                    onChange={(e) => setMountOption(e.target.value)}
                    className="custom-select"
                  >
                    <option value="Без крепления">Без крепления</option>
                    <option value="BOBOVR S3 PRO">BOBOVR S3 PRO — 6 990 ₽</option>
                    <option value="BOBOVR M3 PRO">BOBOVR M3 PRO — 4 490 ₽</option>
                  </select>
                </label>
              ) : newDevice.model === "Pico 4 Ultra" ? (
                <label>
                  Крепление:
                  <select
                    value={mountOption}
                    onChange={(e) => setMountOption(e.target.value)}
                    className="custom-select"
                  >
                    <option value="Без крепления">Без крепления</option>
                    <option value="BOBOVR P4U">BOBOVR P4U — 6 990 ₽</option>
                    <option value="BOBOVR P4S">BOBOVR P4S — 5 490 ₽</option>
                  </select>
                </label>
              ) : (
                <label>
                  Крепление:
                  <select disabled className="custom-select">
                    <option>Недоступно</option>
                  </select>
                </label>
              )}

              <div className="total-price">
                Итого: {previewNewDevicesTotal().toLocaleString()} ₽
              </div>
            </div>
          </div>
        </section>

        <button onClick={calculate} className="btn-calc">
          Рассчитать обмен
        </button>

        {result && (
          <section className="section result">
            <h2>Результат расчёта</h2>
            <ul>
              {result.devicesList.map((d, i) => (
                <li key={i}>
                  {d.description} × {d.quantity} ({d.condition}) = {d.totalValue.toLocaleString()} ₽
                </li>
              ))}
            </ul>
            <p><strong>Итого стоимость выкупа:</strong> {result.totalTradeIn.toLocaleString()} ₽</p>
            <p><strong>Получаете:</strong></p>
            <p>• {result.newDeviceDesc} × {result.newDeviceQuantity} = {result.deviceCost.toLocaleString()} ₽</p>
            {result.mountDescription && (
              <p>• {result.mountDescription} = {result.mountCost.toLocaleString()} ₽</p>
            )}
            <p><strong>Общая стоимость новых устройств:</strong> {result.newDevicesTotal.toLocaleString()} ₽</p>
            <p><strong>Доплата:</strong> <b>{result.balance > 0 ? result.balance.toLocaleString() : 0} ₽</b></p>
            {result.balance <= 0 && (
              <p className="success">
                Стоимость новых устройств покрывается выкупом старых
              </p>
            )}

            <div style={{ marginTop: "20px" }}>
              <button
                className="btn"
                onClick={() => {
                  const text = `
Сдаёте:
${result.devicesList.map(d => `• ${d.description} × ${d.quantity} (${d.condition}) = ${d.totalValue.toLocaleString()} ₽`).join('\n')}
Итого выкуп: ${result.totalTradeIn.toLocaleString()} ₽
Получаете:
• ${result.newDeviceDesc} × ${result.newDeviceQuantity} = ${result.deviceCost.toLocaleString()} ₽
${result.mountDescription ? `• ${result.mountDescription} = ${result.mountCost.toLocaleString()} ₽` : ''}
Общая стоимость: ${result.newDevicesTotal.toLocaleString()} ₽
Доплата: ${result.balance > 0 ? result.balance.toLocaleString() : 0} ₽
                  `.trim();
                  navigator.clipboard.writeText(text).then(
                    () => alert("Результат скопирован!"),
                    () => alert("Не удалось скопировать")
                  );
                }}
              >
                Скопировать результат
              </button>
            </div>
          </section>
        )}
      </div>
      <footer className="footer">
  <div className="footer-content">
    <p className="footer-contact">
      <strong>Свяжитесь с нами:</strong>
    </p>
    <div className="footer-links">
      <a 
        href="https://t.me/YaroslavEdigaryev" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="footer-link telegram"
      >
        Telegram
      </a>
      {" "}•{" "}
      <a 
  href="https://wa.me/79221233210" 
  target="_blank" 
  rel="noopener noreferrer"
>
  WhatsApp
</a>
    </div>
    <p className="footer-website">
      <a 
        href="https://ваш-сайт.рф" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="footer-link site"
      >
        Перейти на основной сайт
      </a>
    </p>
    <p className="footer-copyright">
      &copy; 2025 BIZON. Все права защищены.
    </p>
  </div>
</footer>
    </div>
    
  );
};

export default App;