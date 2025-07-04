import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { useTelegramBackButton } from "../../shared/hooks/useTelegramBackButton";
import { useAuthStore } from "../../shared/stores/auth.store";
import useCreateMe from "../../api/hooks/mutations/create-me";

export function PolicyRead() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  useTelegramBackButton({ showOnMount: true, hideOnUnmount: true });

  const createMeMutation = useCreateMe();
  const register = async () => {
    await createMeMutation.mutateAsync();
    setAuth(true);
  };
  return (
    <div>
      <h1 className="py-6 font-semibold text-2xl px-3">
        Оферта на оказание услуг по организации доступа к играм на площадках
        по&nbsp;падел
      </h1>
      <p className="px-3 mb-4">
        <span className="font-semibold">Исполнитель (Организатор):</span>{" "}
        ИП&nbsp;Алиев&nbsp;Гаджимурад&nbsp;Магомедалиевич
        <br />
        ИНН&nbsp;053301958612, ОГРНИП&nbsp;322774600752240
      </p>
      {/* Top-level нумерованный список */}
      <ol className="list-decimal ml-4 space-y-6">
        {/* 1 */}
        <li>
          <h2 className="font-semibold text-xl py-4">Общие положения</h2>
          <ol className="list-decimal ml-6 space-y-1">
            <li>
              Организатор проводит турниры по&nbsp;падел на&nbsp;различных
              площадках.
            </li>
            <li>
              <span className="font-semibold">Участник</span> — физическое лицо,
              оплатившее участие в&nbsp;турнире и&nbsp;согласившееся
              с&nbsp;условиями настоящей Оферты.
            </li>
            <li>
              Оплата участия означает полное согласие с&nbsp;условиями Оферты.
            </li>
          </ol>
        </li>
        {/* 2 */}
        <li>
          <h2 className="font-semibold text-xl py-4">
            Условия участия и&nbsp;оплаты
          </h2>
          <ol className="list-decimal ml-6 space-y-1">
            <li>
              Участник оплачивает стоимость вступления в&nbsp;турнир
              в&nbsp;размере, указанном при&nbsp;регистрации.
            </li>
            <li>
              Возврат средств:
              <ol className="list-decimal ml-6 space-y-1 mt-1">
                <li>
                  При&nbsp;отмене участия менее чем&nbsp;за&nbsp;24&nbsp;часа
                  до&nbsp;начала турнира деньги не&nbsp;возвращаются, услуга
                  считается оказанной.
                </li>
                <li>
                  При&nbsp;отмене более чем&nbsp;за&nbsp;24&nbsp;часа — возможен
                  возврат за&nbsp;вычетом комиссии&nbsp;10%.
                </li>
              </ol>
            </li>
            <li>
              Организатор оставляет за&nbsp;собой право отменить турнир
              с&nbsp;полным возвратом средств участникам.
            </li>
          </ol>
        </li>
        {/* 3 */}
        <li>
          <h2 className="font-semibold text-xl py-4">Ответственность</h2>
          <ol className="list-decimal ml-6 space-y-1">
            <li>
              Участник осознаёт риски, связанные с&nbsp;занятием спортом,
              и&nbsp;подтверждает отсутствие медицинских противопоказаний.
              Организатор рекомендует участникам оформить спортивную страховку.
            </li>
            <li>
              Организатор не&nbsp;несёт ответственности:
              <ol className="list-decimal ml-6 space-y-1 mt-1">
                <li>
                  за&nbsp;травмы, повреждения или&nbsp;иной вред здоровью
                  участников;
                </li>
                <li>
                  за&nbsp;действия третьих лиц (клубов, других игроков
                  и&nbsp;т.&nbsp;д.);
                </li>
                <li>
                  за&nbsp;форс-мажорные обстоятельства (погода, закрытие
                  площадки и&nbsp;проч.).
                </li>
              </ol>
            </li>
            <li>
              Участник обязуется соблюдать внутренние правила арендуемой
              площадки (клуба), где проводится турнир.
            </li>
          </ol>
        </li>
        {/* 4 */}
        <li>
          <h2 className="font-semibold text-xl py-4">
            Использование изображений
          </h2>
          <p>
            Участник соглашается, что Организатор вправе использовать его фото-
            и&nbsp;видео‑материалы, сделанные во&nbsp;время турнира,
            в&nbsp;рекламных и&nbsp;информационных целях (соцсети, сайт,
            печатные материалы).
          </p>
        </li>
        {/* 5 */}
        <li>
          <h2 className="font-semibold text-xl py-4">Персональные данные</h2>
          <ol className="list-decimal ml-6 space-y-1">
            <li>
              Участник соглашается на&nbsp;обработку персональных данных (ФИО,
              контактные данные) в&nbsp;целях организации турнира.
            </li>
            <li>
              Данные не&nbsp;передаются третьим лицам без&nbsp;согласия
              участника, кроме случаев, предусмотренных законодательством.
            </li>
          </ol>
        </li>
        {/* 6 */}
        <li>
          <h2 className="font-semibold text-xl py-4">Прочие условия</h2>
          <ol className="list-decimal ml-6 space-y-1">
            <li>
              Организатор вправе изменять условия Оферты с&nbsp;уведомлением
              участников.
            </li>
            <li>
              Все споры решаются путём переговоров,
              а&nbsp;при&nbsp;невозможности — в&nbsp;суде по&nbsp;месту
              регистрации Организатора.
            </li>
          </ol>
        </li>
      </ol>

      {/* ============================
  Политика обработки персональных данных
  ============================ */}
      <h1 className="py-6 font-semibold text-2xl px-3 mt-10">
        Политика обработки персональных данных
      </h1>
      {/* Top-level нумерованный список */}
      <ol className="list-decimal ml-4 space-y-6">
        {/* 1 */}
        <li>
          <h2 className="font-semibold text-xl py-4">Общие положения</h2>
          <ol className="list-decimal ml-6 space-y-1">
            <li>
              Настоящая&nbsp;Политика определяет порядок обработки и&nbsp;защиты
              персональных данных пользователей сайта{" "}
              <span className="underline">russianpadel.ru</span>,
              телеграм‑мини‑приложения{" "}
              <span className="underline">@Gopadel_league_bot</span>{" "}
              и&nbsp;их&nbsp;страниц (далее&nbsp;— Сайт), а&nbsp;также меры
              по&nbsp;обеспечению их&nbsp;безопасности.
            </li>
            <li>
              Политика разработана в&nbsp;соответствии с&nbsp;Федеральным
              законом&nbsp;РФ&nbsp;от&nbsp;27.07.2006&nbsp;№&nbsp;152-ФЗ
              «О&nbsp;персональных данных».
            </li>
            <li>
              Используя&nbsp;Сайт и&nbsp;приложение, пользователь выражает
              согласие с&nbsp;настоящей&nbsp;Политикой.
            </li>
          </ol>
        </li>
        {/* 2 */}
        <li>
          <h2 className="font-semibold text-xl py-4">
            Цели обработки персональных данных
          </h2>
          <ol className="list-decimal ml-6 space-y-1">
            <li>
              исполнение обязательств по&nbsp;договорам с&nbsp;пользователями
              и&nbsp;партнёрами;
            </li>
            <li>обеспечение работы&nbsp;Сайта и&nbsp;его&nbsp;сервисов;</li>
            <li>
              регистрация и&nbsp;авторизация пользователей (при&nbsp;наличии
              соответствующих функций);
            </li>
            <li>проведение маркетинговых исследований и&nbsp;аналитики;</li>
            <li>
              информирование о&nbsp;новостях, акциях и&nbsp;специальных
              предложениях;
            </li>
            <li>выполнение требований законодательства&nbsp;РФ.</li>
          </ol>
        </li>
        {/* 3 */}
        <li>
          <h2 className="font-semibold text-xl py-4">
            Состав обрабатываемых персональных данных
          </h2>
          <ol className="list-decimal ml-6 space-y-1">
            <li>фамилия, имя, отчество;</li>
            <li>
              контактная информация: номер телефона, адрес электронной почты;
            </li>
            <li>адрес проживания (если&nbsp;предоставляется пользователем);</li>
            <li>
              технические данные об&nbsp;устройстве, IP‑адрес, cookies, история
              посещений&nbsp;сайта;
            </li>
            <li>
              иные данные, предоставленные пользователем добровольно
              через&nbsp;формы на&nbsp;сайте.
            </li>
          </ol>
        </li>
        {/* 4 */}
        <li>
          <h2 className="font-semibold text-xl py-4">
            Основания для обработки
          </h2>
          <ol className="list-decimal ml-6 space-y-1">
            <li>
              согласие пользователя, выраженное при&nbsp;отправке форм
              на&nbsp;Сайте;
            </li>
            <li>заключение и&nbsp;исполнение договора с&nbsp;пользователем;</li>
            <li>выполнение требований законодательства.</li>
          </ol>
        </li>
        {/* 5 */}
        <li>
          <h2 className="font-semibold text-xl py-4">Права пользователя</h2>
          <ol className="list-decimal ml-6 space-y-1">
            <li>
              получать информацию об&nbsp;обработке своих персональных данных;
            </li>
            <li>
              требовать уточнения, блокировки или&nbsp;удаления персональных
              данных;
            </li>
            <li>отозвать ранее данное согласие на&nbsp;обработку данных;</li>
            <li>
              направлять запросы об&nbsp;обработке данных по&nbsp;контактам,
              указанным в&nbsp;разделе&nbsp;9.
            </li>
          </ol>
        </li>
        {/* 6 */}
        <li>
          <h2 className="font-semibold text-xl py-4">
            Защита персональных данных
          </h2>
          <p className="mb-2">
            Организация применяет необходимые правовые, организационные
            и&nbsp;технические меры для&nbsp;защиты персональных данных
            от&nbsp;несанкционированного доступа, изменения, раскрытия
            или&nbsp;уничтожения.
          </p>
          <p>
            Доступ к&nbsp;персональным данным имеют только уполномоченные
            сотрудники, подписавшие обязательство о&nbsp;конфиденциальности.
          </p>
        </li>
        {/* 7 */}
        <li>
          <h2 className="font-semibold text-xl py-4">
            Передача персональных данных третьим лицам
          </h2>
          <ol className="list-decimal ml-6 space-y-1">
            <li>при&nbsp;наличии согласия пользователя;</li>
            <li>
              по&nbsp;требованию закона (по&nbsp;запросу суда
              или&nbsp;правоохранительных органов);
            </li>
            <li>
              в&nbsp;рамках использования сторонних сервисов (платёжные системы,
              email‑рассылки), обеспечивающих выполнение целей, указанных
              в&nbsp;разделе&nbsp;2.
            </li>
          </ol>
        </li>
        {/* 8 */}
        <li>
          <h2 className="font-semibold text-xl py-4">
            Использование файлов cookie
          </h2>
          <p>
            Сайт может использовать cookie‑файлы для&nbsp;анализа
            пользовательской активности и&nbsp;улучшения работы ресурса.
            Пользователь может отключить cookie в&nbsp;настройках браузера,
            однако это может повлиять на&nbsp;функциональность некоторых
            сервисов.
          </p>
        </li>
        {/* 9 */}
        <li>
          <h2 className="font-semibold text-xl py-4">Контактная информация</h2>
          <p className="mb-2">
            <span className="font-semibold">GoPadel&nbsp;Community</span>
            <br />
            Email:{" "}
            <a
              className="text-blue-600 underline"
              href="mailto:info@russianpadel.ru"
            >
              info@russianpadel.ru
            </a>
          </p>
        </li>
      </ol>

      <div className="mb-10 flex flex-row gap-4 justify-center">
        <Button className="bg-[#F8F8FA]" onClick={() => navigate(-1)}>
          Отмена
        </Button>
        <Button
          onClick={async () => {
            try {
              await register();
              navigate("/registration");
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
              alert("Упс, что-то пошло не так");
            }
          }}
        >
          Принимаю
        </Button>
      </div>
    </div>
  );
}
