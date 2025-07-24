import React, { useState } from "react";
import "./App.css";

const App = () => {
  const tradeInPrices = {
    "Quest 2": { "64": 13500, "128": 15500, "256": 16500 },
    "Pico 4": { "128": 16500, "256": 18000 },
  };

  const newDevicePrices = {
    "Quest 3s": { "128": 24200, "256": 31490 },
    "Quest 3": { "128": 24190, "512": 39490 },
    "Pico 4 Ultra": { "256": 39500 },
  };

  const oldModels = Object.keys(tradeInPrices);
  const newModels = Object.keys(newDevicePrices);

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
      const updated = oldDevices.filter((_, i) => i !== index);
      setOldDevices(updated);
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
    let basePrice = tradeInPrices[device.model]?.[device.memory] || 0;
    const bonuses =
      (device.battery ? 500 : 0) + (device.mount ? 500 : 0) + (device.box ? 500 : 0);

    let conditionMultiplier = 1;
    switch (device.condition) {
      case "хорошее":
        conditionMultiplier = 0.9;
        break;
      case "удовлетворительное":
        conditionMultiplier = 0.70;
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
    return (
      (newDevicePrices[newDevice.model]?.[newDevice.memory] || 0) *
      newDevice.quantity
    );
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
    const newDevicesCost = calculateNewDevicesCost();
    const balance = newDevicesCost - totalTradeIn;

    const devicesList = oldDevices.map((device) => ({
      description: getDeviceDescription(device),
      quantity: device.quantity,
      totalValue: calculateDeviceValue(device) * device.quantity,
      condition: device.condition,
    }));

    setResult({
      devicesList,
      totalTradeIn,
      newDevicesCost,
      balance,
      newDeviceDesc: `${newDevice.model} ${newDevice.memory}ГБ`,
      newDeviceQuantity: newDevice.quantity,
    });
  };

  return (
    <div className="app-container">
      <h1>Калькулятор трейд-ин VR-оборудования</h1>

      <section className="section">
        <h2>Вы сдаёте</h2>
        <button onClick={addOldDevice} className="btn">
          + Добавить конфигурацию
        </button>

        {oldDevices.map((device, i) => (
          <div key={i} className="device-card">
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
                    onChange={(e) => updateOldDevice(i, "box", e.target.checked)}
                  />
                  Коробка
                </label>

                <label>
                  Состояние:
                  <select
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
                  Сумма: {calculateDeviceValue(device) * device.quantity} ₽
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
    {/* Левая колонка: форма */}
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
        <button type="button" onClick={decrementNewQuantity}>−</button>
        <input
          type="number"
          min="1"
          value={newDevice.quantity}
          onChange={(e) => {
            const value = e.target.valueAsNumber;
            if (value >= 1) {
              setNewDevice((prev) => ({ ...prev, quantity: value }));
            }
          }}
          className="quantity-input"
          aria-label="Количество"
        />
        <button type="button" onClick={incrementNewQuantity}>+</button>
      </label>
    </div>

    {/* Правая колонка: итоговая стоимость */}
    <div className="new-device-total">
      <div className="total-price">
        Итоговая стоимость: <strong>{calculateNewDevicesCost()} ₽</strong>
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
                {d.description} × {d.quantity} ({d.condition}) ={" "}
                {d.totalValue.toLocaleString()} ₽
              </li>
            ))}
          </ul>
          <p>Сумма выкупа: {result.totalTradeIn.toLocaleString()} ₽</p>
          <p>
            Новые устройства: {result.newDeviceDesc} × {result.newDeviceQuantity} ={" "}
            {result.newDevicesCost.toLocaleString()} ₽
          </p>
          <p>
            Доплата к обмену:{" "}
            <b>{result.balance > 0 ? result.balance.toLocaleString() : 0} ₽</b>
          </p>
          {result.balance <= 0 && (
            <p className="success">
              Стоимость новых устройств покрывается выкупом старых
            </p>
          )}
        </section>
      )}
    </div>
  );
};

export default App;
