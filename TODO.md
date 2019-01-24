-gdy gracz wyrzuci 6 to moze rzucic jeszcze raz

RELEASE
- menu: nowa gra, fullscreen, pomoc (skroty)
- modal wyboru koloru -> wybor pionka, planszy i tla
- test innej gry? zmiana ukladu pol na planszy, zasady ruchu
- ekran wyboru gry
- pierwsza animacja: 
1. plansza 'opakowuje' sie w teksture (skaluj prostokaty)
2. pionki wjezdzaja od gory
3. pionki ruszaja sie na zmiane
- ekran zachety przejscia do fullscreena

- blad wygranej gracza: akcja finishGame leci dwukrotnie, raz z poprawnym wygranym a raz z drugim
- player zalogowany w expresie, niezalogowany w serwerze socketowym (po restarcie serwera)
- index.js: jesli socket nie jest autoryzowany to stworz tymaczasowego playera
- uspojnienie modelu playera (niezalogowany, tymczasowy, zalogowany, trwaly)
- update playera socketowego po zalogowaniu
- posprzatac cala autoryzacje - najlepiej zamknac w 1 pliku
- revoke token gdy kasujesz usera
- logi: player sie zalogowal, nie zalogowal (err), zarejestrowal, nie zarejestrowal (err)
- rzeczy z modelu socketowego playera zwiazane z rozgrywka przeniesc do gameState, dodac pole gameState: null, w modelu z bazy
- rozwazyc przypadek gdy ktos sie loguje w trakcie gry
- napis offline widoczny tez w grze
- po wylogowaniu updatePlayera do temporary
- tlo animowane

Dalszy rozwój:
- token powinien byc revoked gdy gracz sie wyloguje: /logout 
- ustalic maxAge w configu i wykorzystac w player.service.js:authenticate i players.controller.js:authenticate 
- registration: password confirmation
- player tymczasowy jest kasowany po 10 minutach od ostatniego wylogowania playera

TO DO
- formularze login i register: wyswietlanie errow z serwera
- bug: inny gracz wygral. zmiana geta na pionki gracza
- moze kazdy gracz powinien sie widziec w prawym/lewym gornym rogu, zeby nie zmieniac wygladu gry
- panel admina - stan polaczen, kolejki, obciazenie serwera
- timer gry: konczenie gry gdy uplynie czas rozgrywki
- timer ruchu gracza: konczenie ruchu gdy uplynie czas
- widoczna zmiana gracza (jezeli twoja kolejka, to bardziej widoczna)
- wyczyscic logi w konsoli podczas gry na serwerze i w przegladarce
- guzik kostki nie powinien byc zaznaczony gdy gracz nie moze rzucic kostka (roomState.rolled = true)
- gdy jeden z graczy wyjdzie przez f5, nie mozna znalezc nowej gry
- na telefonach domyslnie orientacja landscape
- config powinien byc uzywany tylko na serwerze i zawierac klucze prywatne

1) Gra
- przy profilu aktualnego gracza, progress jego kolejki
- testy wychodzenia z gry / disconnect / szukanie nowej rozgrywki
- koniec rozgrywki gdy sie skonczy czas

2) Strona Ludo
-wybór (graj sam lub ze znajomymi)

3) Strona główna
-lista gier

5) Panel admina
-wyswietlac server log obok stanu

DONE:
+ podczas robienia akcji powinien byc sprawdzany timestamp pokoju
+ wygrana jak wszystkie pionki ktos zdobyl jako pierwszy (test 2 graczy)
+ blokada stania na tym samym polu
+ początkowy stan w Room.js powinien byc brany z klasy gry
+ wywalic stare metody z serwera
+zbudowac dokumentacje, poprawic
+wszystkie pliki ludo wrzucic do games/ludo
+dodac ludo do Games
+profil aktualnie zalogowanego gracza
+wyglad navbara w trakcie gry
+wyłącz grę jak ktoś wyjdzie - dialog z ponownym wyszukaniem
+obsluga rozlaczenia sie gracza
+ przekazywanie ustawien graczy do gry
+ niedorobiona kreska w grafica jednego pola
+ pola graczy ktorych nie ma wyszarzone
+ wyciagnac wspolna funkcje do liczenia ciagu pozycji pionka
+ animacja wejscia pionkow
+ koniec gry gdy wszystkie pionki gracza sa w spawnie
 + wyskakuje modal ze zwyciezca
 + gra jest kasowana na serwerze
+ blokada grania gdy poprzedni gracz jeszcze gra
+ czasy animacji ruchu pionka i rzutu kostka zapisane w Config.ludo
+ jak gracz A stanie na pionku gracza B, to pionek gracza B wraca na spawn
+ timer - dlugosc gry ustalana z serwera - widoczny na gorze mapy - kolor aktualnego gracza
+ naprawic nowa rozgrywke
+ profile graczy przy starcie wysuwaja sie z prawej i lewej strony
-- najpierw leci kostka, a potem pionek sie rusza - nie na raz
+ekran wyszukiwania z przewidywanym czasem
+wybór koloru
+ekran gry
+ wybor pionka
+przerobienie wygladu profili
+zaznaczenie aktualnego gracza
+ napraw nowa gre
+ wywalic config z roomState
+obsluga disconnected:
 +_destroyConnection nie kasuje pokoju, przez co gracz go nie opuszcza
 +obsluzyc update gracza po stronie klienta
 +wyszarzenie pionkow i avatara
 +akcja Disconnected i obsluga na stronie Ludo
 +dodac sprawdzanie actywnych graczy w roll handlerze
 +jezeli wyszla osoba ktora jest aktualnie, ustaw nastepna osobe 
+ stan disconnected aplikacji
+ gdy gracz rzuci 6, moze rzucic jeszcze raz
+ gdy sa 2 pionki obok siebie (gora/dol) to w ten wyzej ciezko jest kliknac
+ ActionsStream
+ zmienic model danych zwracanych akcji na [{action, delayTimestamp, callback}]
+ w handlerach powinno byc sprawdzanie czy mozna te akcje wykonac
+ refaktor games/ludo/index.js
+ wywalic waitingForAction na serwerze bo nie jest uzywane
-- optymalizacja builda
-- brak synchro czasowego 2 graczy. gracz z opoznieniem ma wrazenie, ze moze rzucic kostka wczesniej.
-- badge przy avatarze usera informujacy o stanie polaczenia (gracz offline jest zaznaczony)
+ jakies info jak rzucic kostka
+ eventy socketowe powinny wysylac roomState tylko przy startGame
+ zmienic socketServer na ioConnector
+ gracz nie jest czyszczony przy F5
+ pierwszy test jednostkowy
+ rejestracja: logika + ui
+ logowanie: logika + ui
+ wykorzystanie modelu playera z bazy danych
+ pionek wraca na spawn, tuz przed zbiciem
+ test 4 graczy
-- obrot ekranu na telefonie do landscape'u
+ fix buga przy disconnectcie
+ rzut kostką - spacją
-- plansza obrocona o 15st.
+ moj gracz na pierwszym miejscu
+ obracamy tylko plansze i pionki
+ fix zaznaczenia pionka
+ zamienic miejscami profile
+ wyrownac pozycje pionka
+ engine: ktorys kolejny init nie powoduje obrotu planszy
+ na telefonie plansza obrocona pod katem 0 st.
+ rozmiar planszy dostosowany do mobilek
+ ukryc navbar, hamburger menu, 
+ fullscreen po prawej na dole (pod f)
+ redesign
+ loader-aplikacji
+ currentPlayer odpowie temporary playerem jesli takiego posiada
+ update playera zaraz po inicjalizacji socketa
+ powinien byc inny frustrumSize dla aspectRatio > 1
+ zmienic board.setSize na board.setRotation(true/false)
+ mayksymalna wysokosc (zeby zmiescili sie gracze)
+ osobny komponent: PlayerProfiles
+ lepsza pozycja dla graczy
+ gracze w zlych miejscach