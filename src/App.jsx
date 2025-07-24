import React, { useState } from "react";

const App = () => {
  // База цен на выкуп старых устройств (₽)
  const tradeInPrices = {
    "Quest 2": {
      "64": 17000,
      "128": 18000,
      "256": 19000,
    },
    "Quest Pro": {
      "256": 32000,
    },
    "Pico 4": {
      "128": 20000,
      "256": 22000,
    },
    "Meta Quest 3": {
      "128": 25000,
      "512": 28000,
    },
  };

  // База цен на новые устройства (₽)
  const newDevicePrices = {
    "Quest 3s": {
      "128": 24200,
      "512": 29900,
    },
    "Pico Neo 4": {
      "128": 28000,
      "256": 32000,
    },
    "Meta Quest 3": {
      "128": 27000,
      "512": 33000,
    },
    "Meta Quest Pro": {
      "256": 55000,
    },
  };

  // Доступные модели
  const oldModels = Object.keys(tradeInPrices);
  const newModels = Object.keys(newDevicePrices);

  // Состояние формы
  const [oldDevices, setOldDevices] = useState([
    { 
      model: oldModels[0], 
      memory: "128", 
      quantity: 1, 
      battery: true, 
      mount: true, 
      box: true,
      condition: "отличное"
    },
  ]);
  const [newDevice, setNewDevice] = useState({
    model: newModels[0],
    memory: "128",
    quantity: 1,
  });

  const [result, setResult] = useState(null);

  // Добавить новое устройство
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
        condition: "отличное"
      },
    ]);
  };

  // Удалить устройство
  const removeOldDevice = (index) => {
    if (oldDevices.length > 1) {
      const updated = oldDevices.filter((_, i) => i !== index);
      setOldDevices(updated);
    }
  };

  // Обновить данные устройства
  const updateOldDevice = (index, field, value) => {
    const updated = [...oldDevices];
    updated[index][field] = value;
    setOldDevices(updated);
  };

  // Обновить новое устройство
  const updateNewDevice = (field, value) => {
    setNewDevice((prev) => ({ ...prev, [field]: value }));
  };

  // Увеличить количество
  const incrementQuantity = (index) => {
    const updated = [...oldDevices];
    updated[index].quantity += 1;
    setOldDevices(updated);
  };

  // Уменьшить количество
  const decrementQuantity = (index) => {
    const updated = [...oldDevices];
    if (updated[index].quantity > 1) {
      updated[index].quantity -= 1;
      setOldDevices(updated);
    }
  };

  // Увеличить количество нового устройства
  const incrementNewQuantity = () => {
    setNewDevice((prev) => ({ ...prev, quantity: prev.quantity + 1 }));
  };

  // Уменьшить количество нового устройства
  const decrementNewQuantity = () => {
    setNewDevice((prev) => ({ ...prev, quantity: prev.quantity > 1 ? prev.quantity - 1 : 1 }));
  };

  // Рассчитать стоимость одного старого устройства
  const calculateDeviceValue = (device) => {
    let basePrice = tradeInPrices[device.model]?.[device.memory] || 0;
    
    // Доплата за комплектацию
    const bonuses = (device.battery ? 500 : 0) + (device.mount ? 500 : 0) + (device.box ? 500 : 0);
    
    // Скидка за состояние
    let conditionMultiplier = 1;
    switch (device.condition) {
      case "отличное":
        conditionMultiplier = 1;
        break;
      case "хорошее":
        conditionMultiplier = 0.9;
        break;
      case "удовлетворительное":
        conditionMultiplier = 0.7;
        break;
      case "неисправное":
        conditionMultiplier = 0.5;
        break;
      default:
        conditionMultiplier = 1;
    }

    return Math.round((basePrice + bonuses) * conditionMultiplier);
  };

  // Рассчитать общую сумму выкупа
  const calculateTotalTradeIn = () => {
    return oldDevices.reduce((total, device) => {
      const unitValue = calculateDeviceValue(device);
      return total + unitValue * device.quantity;
    }, 0);
  };

  // Рассчитать стоимость новых устройств
  const calculateNewDevicesCost = () => {
    const unitPrice = newDevicePrices[newDevice.model]?.[newDevice.memory] || 0;
    return unitPrice * newDevice.quantity;
  };

  // Получить текстовое описание устройства
  const getDeviceDescription = (device) => {
    const includedParts = [];
    if (device.battery) includedParts.push("с аккумулятором");
    if (device.mount) includedParts.push("с креплением");
    if (device.box) includedParts.push("с коробкой");

    let desc = `${device.model} ${device.memory}ГБ (${includedParts.join(", ")})`;
    return desc;
  };

  // Выполнить расчёт
  const calculate = () => {
    const totalTradeIn = calculateTotalTradeIn();
    const newDevicesCost = calculateNewDevicesCost();
    const balance = newDevicesCost - totalTradeIn;

    const devicesList = oldDevices.map(device => ({
      description: getDeviceDescription(device),
      quantity: device.quantity,
      totalValue: calculateDeviceValue(device) * device.quantity,
      condition: device.condition
    }));

    setResult({
      devicesList,
      totalTradeIn,
      newDevicesCost,
      balance,
      newDeviceDesc: `${newDevice.model} ${newDevice.memory}ГБ`,
      newDeviceQuantity: newDevice.quantity
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
            <h1 className="text-3xl font-bold">Калькулятор трейд-ин VR-оборудования</h1>
            <p className="text-indigo-100 mt-2">Оцените стоимость обмена старых VR-устройств на новые</p>
          </div>

          <div className="p-8">
            {/* Старые устройства */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Вы сдаёте</h2>
                <button
                  onClick={addOldDevice}
                  className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  + Добавить конфигурацию
                </button>
              </div>

              {oldDevices.map((device, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 mb-4 last:mb-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4 items-center">
                    {/* Модель */}
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Модель</label>
                      <select
                        value={device.model}
                        onChange={(e) => updateOldDevice(index, "model", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        {oldModels.map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Объём памяти */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Объём</label>
                      <select
                        value={device.memory}
                        onChange={(e) => updateOldDevice(index, "memory", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        {Object.keys(tradeInPrices[device.model] || {}).map((memory) => (
                          <option key={memory} value={memory}>
                            {memory} ГБ
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Количество с кнопками */}
                    <div className="flex items-center gap-3">
                      <label className="block text-sm font-medium text-gray-700 whitespace-nowrap">Кол-во</label>
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                          onClick={() => decrementQuantity(index)}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200"
                        >
                          −
                        </button>
                        <span className="px-4 py-2 bg-white min-w-[40px] text-center font-medium">
                          {device.quantity}
                        </span>
                        <button
                          onClick={() => incrementQuantity(index)}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Комплектация */}
                    <div className="lg:col-span-4 flex flex-wrap gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={device.battery}
                          onChange={(e) => updateOldDevice(index, "battery", e.target.checked)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Аккумулятор</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={device.mount}
                          onChange={(e) => updateOldDevice(index, "mount", e.target.checked)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Крепление</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={device.box}
                          onChange={(e) => updateOldDevice(index, "box", e.target.checked)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Коробка</span>
                      </label>
                    </div>

                    {/* Состояние */}
                    <div className="lg:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Состояние</label>
                      <select
                        value={device.condition}
                        onChange={(e) => updateOldDevice(index, "condition", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="отличное">Отличное (100%)</option>
                        <option value="хорошее">Хорошее (90%)</option>
                        <option value="удовлетворительное">Удовлетворительное (70%)</option>
                        <option value="неисправное">Неисправное (50%)</option>
                      </select>
                    </div>

                    {/* Сумма выкупа */}
                    <div className="text-right">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Сумма</label>
                      <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-right font-medium">
                        {calculateDeviceValue(device) * device.quantity} ₽
                      </div>
                    </div>
                  </div>

                  {/* Кнопка удаления (кроме последнего) */}
                  {oldDevices.length > 1 && (
                    <div className="mt-4 text-right">
                      <button
                        onClick={() => removeOldDevice(index)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Удалить конфигурацию
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Новое устройство */}
            <div className="mb-8 p-6 bg-blue-50 rounded-xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Получаете</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                {/* Модель */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Модель</label>
                  <select
                    value={newDevice.model}
                    onChange={(e) => updateNewDevice("model", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {newModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Объём памяти */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Объём</label>
                  <select
                    value={newDevice.memory}
                    onChange={(e) => updateNewDevice("memory", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {Object.keys(newDevicePrices[newDevice.model] || {}).map((memory) => (
                      <option key={memory} value={memory}>
                        {memory} ГБ
                      </option>
                    ))}
                  </select>
                </div>

                {/* Количество с кнопками */}
                <div className="flex items-center gap-3">
                  <label className="block text-sm font-medium text-gray-700 whitespace-nowrap">Кол-во</label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={decrementNewQuantity}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 bg-white min-w-[40px] text-center font-medium">
                      {newDevice.quantity}
                    </span>
                    <button
                      onClick={incrementNewQuantity}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Итоговая стоимость */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Итоговая стоимость</label>
                  <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg font-medium text-right">
                    {calculateNewDevicesCost()} ₽
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопка расчёта */}
            <div className="text-center">
              <button
                onClick={calculate}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
              >
                Рассчитать обмен
              </button>
            </div>

            {/* Результат */}
            {result && (
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Результат расчёта</h3>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📦</span>
                    <div>
                      <strong className="font-medium">Вы сдаёте:</strong>
                      <ul className="mt-1 space-y-1">
                        {result.devicesList.map((item, i) => (
                          <li key={i} className="text-sm">
                            — {item.description} × {item.quantity} ({item.condition}) = {item.totalValue.toLocaleString()} ₽
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💰</span>
                    <div>
                      <strong className="font-medium">Сумма выкупа:</strong> {result.totalTradeIn.toLocaleString()} ₽
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🆕</span>
                    <div>
                      <strong className="font-medium">Новые устройства:</strong> {result.newDeviceDesc} × {result.newDeviceQuantity} = {result.newDevicesCost.toLocaleString()} ₽
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-green-200">
                    <span className="text-2xl">💳</span>
                    <div className="text-lg font-bold text-green-700">
                      Доплата к обмену: {result.balance > 0 ? result.balance.toLocaleString() : 0} ₽
                    </div>
                  </div>
                </div>

                {result.balance <= 0 && (
                  <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-800 text-sm">
                    <strong>Отлично!</strong> Стоимость новых устройств полностью покрывается выкупом старых.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6 text-gray-500 text-sm">
          © 2024 Калькулятор трейд-ин VR-оборудования
        </div>
      </div>
    </div>
  );
};

export default App;