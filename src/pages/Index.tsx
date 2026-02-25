import { useState } from "react";
import { FileText, User, Scale, CreditCard, Phone, MapPin, Calendar, Hash, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mainServices, singleServices, tariffs, type ServiceRole } from "@/data/services";
import { generateContract } from "@/lib/generateContract";
import { toast } from "sonner";

type ServiceType = "main" | "single";

const Index = () => {
  const [serviceType, setServiceType] = useState<ServiceType>("main");
  const [role, setRole] = useState<ServiceRole>("plaintiff");
  const [categoryIndex, setCategoryIndex] = useState<string>("");
  const [serviceIndex, setServiceIndex] = useState<string>("");
  const [singleServiceIndex, setSingleServiceIndex] = useState<string>("");
  const [tariffIndex, setTariffIndex] = useState<string>("");

  const [contractNum, setContractNum] = useState("");
  const [dateZakl, setDateZakl] = useState("");
  const [fio, setFio] = useState("");
  const [dataRod, setDataRod] = useState("");
  const [passport, setPassport] = useState("");
  const [adres, setAdres] = useState("");
  const [phone, setPhone] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);

  const selectedCategory = categoryIndex !== "" ? mainServices[parseInt(categoryIndex)] : null;

  const getSutPor = (): string => {
    if (serviceType === "single" && singleServiceIndex !== "") {
      const svc = singleServices[parseInt(singleServiceIndex)];
      return svc.description;
    }
    if (serviceType === "main" && selectedCategory && serviceIndex !== "") {
      const item = selectedCategory.items[parseInt(serviceIndex)];
      return role === "plaintiff" ? item.plaintiff : item.defendant;
    }
    return "";
  };

  const handleGenerate = async () => {
    if (!contractNum || !dateZakl || !fio || !dataRod || !passport || !adres || tariffIndex === "") {
      toast.error("Заполните все обязательные поля!");
      return;
    }
    const sutPor = getSutPor();
    if (!sutPor) {
      toast.error("Выберите услугу!");
      return;
    }

    const tariff = tariffs[parseInt(tariffIndex)];
    setIsGenerating(true);
    try {
      await generateContract({
        contract_num: contractNum,
        date_zakl: dateZakl,
        fio,
        data_rod: dataRod,
        passport,
        summa: tariff.summa,
        sut_por: sutPor,
        adres,
        phone,
        payment: tariff.payment,
        months: tariff.months,
        nds: tariff.nds,
      });
      toast.success("Договор успешно сгенерирован!");
    } catch (e) {
      console.error(e);
      toast.error("Ошибка при генерации договора");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Scale className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Генератор договоров</h1>
            <p className="text-sm text-muted-foreground">Юридическое бюро «Рапид Право»</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Service Selection */}
        <div className="form-section">
          <h2 className="form-section-title">
            <FileText className="w-5 h-5 text-primary" />
            Выбор услуги
          </h2>

          {/* Service type toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => { setServiceType("main"); setSingleServiceIndex(""); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${serviceType === "main" ? "role-toggle-active" : "role-toggle-inactive"}`}
            >
              Основные услуги
            </button>
            <button
              onClick={() => { setServiceType("single"); setCategoryIndex(""); setServiceIndex(""); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${serviceType === "single" ? "role-toggle-active" : "role-toggle-inactive"}`}
            >
              Разовые услуги
            </button>
          </div>

          {serviceType === "main" && (
            <>
              {/* Role toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setRole("plaintiff")}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${role === "plaintiff" ? "role-toggle-active" : "role-toggle-inactive"}`}
                >
                  👤 Со стороны Истца / Заявителя
                </button>
                <button
                  onClick={() => setRole("defendant")}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${role === "defendant" ? "role-toggle-active" : "role-toggle-inactive"}`}
                >
                  🛡️ Со стороны Ответчика
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-1.5 block">Категория дела</Label>
                  <Select value={categoryIndex} onValueChange={(v) => { setCategoryIndex(v); setServiceIndex(""); }}>
                    <SelectTrigger><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                    <SelectContent>
                      {mainServices.map((cat, i) => (
                        <SelectItem key={i} value={String(i)}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-1.5 block">Вид услуги</Label>
                  <Select value={serviceIndex} onValueChange={setServiceIndex} disabled={!selectedCategory}>
                    <SelectTrigger><SelectValue placeholder="Выберите услугу" /></SelectTrigger>
                    <SelectContent>
                      {selectedCategory?.items.map((item, i) => (
                        <SelectItem key={i} value={String(i)}>{item.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preview */}
              {serviceIndex !== "" && selectedCategory && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Суть поручения:</p>
                  <p className="text-sm text-foreground leading-relaxed">
                    Формирование правовой позиции, {getSutPor()}
                  </p>
                </div>
              )}
            </>
          )}

          {serviceType === "single" && (
            <>
              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">Услуга</Label>
                <Select value={singleServiceIndex} onValueChange={setSingleServiceIndex}>
                  <SelectTrigger><SelectValue placeholder="Выберите услугу" /></SelectTrigger>
                  <SelectContent>
                    {singleServices.map((svc, i) => (
                      <SelectItem key={i} value={String(i)}>{svc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {singleServiceIndex !== "" && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Суть поручения:</p>
                  <p className="text-sm text-foreground leading-relaxed">
                    Формирование правовой позиции, {getSutPor()}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Client Data */}
        <div className="form-section">
          <h2 className="form-section-title">
            <User className="w-5 h-5 text-primary" />
            Данные доверителя
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-muted-foreground" /> Номер договора
              </Label>
              <Input value={contractNum} onChange={(e) => setContractNum(e.target.value)} placeholder="1765" />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Дата договора
              </Label>
              <Input value={dateZakl} onChange={(e) => setDateZakl(e.target.value)} placeholder="22.10.2025" />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" /> ФИО
              </Label>
              <Input value={fio} onChange={(e) => setFio(e.target.value)} placeholder="Иванов Иван Иванович" />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Дата рождения
              </Label>
              <Input value={dataRod} onChange={(e) => setDataRod(e.target.value)} placeholder="25.05.1990" />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-1.5 block">Паспорт</Label>
              <Input value={passport} onChange={(e) => setPassport(e.target.value)} placeholder="45 04 123456" />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Адрес регистрации
              </Label>
              <Input value={adres} onChange={(e) => setAdres(e.target.value)} placeholder="г. Санкт-Петербург, ул. Примерная, д. 1, кв. 1" />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Телефон
              </Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 901 234 56 78" />
            </div>
          </div>
        </div>

        {/* Tariff */}
        <div className="form-section">
          <h2 className="form-section-title">
            <CreditCard className="w-5 h-5 text-primary" />
            Стоимость и рассрочка
          </h2>
          <Select value={tariffIndex} onValueChange={setTariffIndex}>
            <SelectTrigger><SelectValue placeholder="Выберите тариф" /></SelectTrigger>
            <SelectContent>
              {tariffs.map((t, i) => (
                <SelectItem key={i} value={String(i)}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {tariffIndex !== "" && (
            <div className="mt-4 p-4 bg-muted rounded-lg grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Сумма</p>
                <p className="text-lg font-semibold text-foreground">{tariffs[parseInt(tariffIndex)].summa.toLocaleString("ru-RU")} ₽</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Платёж/мес</p>
                <p className="text-lg font-semibold text-foreground">{tariffs[parseInt(tariffIndex)].payment.toLocaleString("ru-RU")} ₽</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Срок</p>
                <p className="text-lg font-semibold text-foreground">{tariffs[parseInt(tariffIndex)].months} мес.</p>
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full h-14 text-lg font-semibold gap-3"
          size="lg"
        >
          <Download className="w-5 h-5" />
          {isGenerating ? "Генерация..." : "Скачать договор .docx"}
        </Button>
      </main>
    </div>
  );
};

export default Index;
