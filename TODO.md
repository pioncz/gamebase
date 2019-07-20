- nie mozna ruszyc pionka po zrobieniu init game
- bug strzalki nad pionkiem (kolejny init game psuje)
- zsynchronizowac pulsowanie pionka i strzalki nad pionkiem
- naprawic buga gdy graja 3 osoby, 1 wyjdzie i poprzednia z listy moze wejsc na jej pole
- test wydajnosci serwera w /admin
- kosci przy kursorze, rzut kostka w dowolnym miejscu na planszy (lub srodek)
- timeout na ekranach przed startem gry
- zamykanie pokoju po jakims czasie - mozliwosc dolaczenia do pokoju po dc
- jak sie rozlaczy podczas wybierania koloru to wraca do kolejki
- 2 tryby rozgrywki: towarzyska, rankingowa
- customowe pionki

- websocket server: przeniesc metody z konstruktora

- mniejsza kostka
- wolniejsza animacja pionka wzgledem kostki
- rzadszy render na telefonach?
- pionek podczas chodzenia 
- room powinien dodawac bota do pokoju a nie botsManager
- zamiana w room: this.gameState.players na this.players this.gameState.playerColors na this.playerColors

- spectators
- blokada prawoklika
- walka graczy o miejsce 2 i 3 
- staty do panelu admina: lagi - ping /pong na stronie admina, mierzenie np przy starcie gry u graczy

Wejscie do gry:
 Z home:
  + User wybiera gre, wysyla findRoom(gameName)
  + Serwer wysyla updateRoom z informacja o jego nowym pokoju
  + User jest przekierowany na room/:id
 Z room/:id
  + jesli nie ma roomId to przekierowanie na home
  + wysyla joinRoom(gameId)
  + jesli nie ma takiej gry, to user widzi modal: 'Taka gra nie istnieje, worc na glowna'
  - jesli jest taka gra, ale nie ma miejsc do grania, user dolacza jako spectator (bedzie otrzymywal roomUpdate)
  - jestli jest taka gra i jest miejsce dla gracza, to user dolacza do pokoju jako gracz

https://threejsfundamentals.org
http://www.andrewberg.com/prototypes/threejs/bokeh/

Frontowe taski:
- dodac podstrony zawierajaca logi z serwera
- zglaszanie bledu - modal z duzym textarea. blokada 1 zgloszenia na 5 minut po stronie serwera (blad: id, date, user, content)
- internacjonalizacja i18next (pl)

- czat (dostepny z menu)
- TEST end to end pelnej rozgrywki graczy testowych z serwerem - 1-3 testy, z porownaniem screenow
- obsluga wielu kart: na drugiej karcie mozesz tylko dolaczyc jako widz do pokoju
- zalogowany gracz traci polaczenie / odswieza strone - do 10s moze wrocic do pokoju bez przegranej

Bugi / mniejsze taski:
- sprawdzic oswietlenie
- logike ruchu bota przeniesc do klasy z gra. dodac testy jednostkowe
- zrobic jakis debug do akcji: odtworzyc rozgrywke za pomoca akcji
- kostka znika dopiero jak gracz sie ruszy
- przy rozlaczeniu trzeba sprawdzic czy skasowac spectatora
- font awesome moze byc niedoladowany gdy engine zrobi swoje pierwszy render ( /engine )
- guzik kostki nie powinien byc zaznaczony gdy gracz nie moze rzucic kostka (roomState.rolled = true)
- test na randomowe akcje od gracza w roznych momentach najpelniejszego testu rzutu kostka
- w pages/ludo przy starcie gry ustawiac czas z configa
- skasowac properte player.color - korzystajmy z playerColors
- koniec gry gdy gameState === RoomStates.Finished, a nie samo winnerId (w przyszlosci obsluga remisu)
- zablokowac przypadek gdy ktos sie loguje w trakcie gry (playersUpdate do graczy z pokoju)
- po wylogowaniu updatePlayera do temporary
- ustalic maxAge w configu i wykorzystac w player.service.js:authenticate i players.controller.js:authenticate
- dodac opcje na telefonach do wylaczenia animacji 
- animacja kostek w tle gdy gracz moze rzucic koscmi

RELEASE
- animacja w wyborze gry: 
1. plansza 'opakowuje' sie w teksture (skaluj prostokaty)
- registration: password confirmation

TO DO
- formularze login i register: wyswietlanie errow z serwera
- panel admina - stan polaczen, kolejki, obciazenie serwera

DONE:
+ podczas robienia akcji powinien byc sprawdzany timestamp pokoju
+ wygrana jak wszystkie pionki ktos zdobyl jako pierwszy (test 2 graczy)
+ blokada stania na tym samym polu
+ początkowy stan w Room.js powinien byc brany z klasy gry
+ wywalic stare metody z serwera
+ zbudowac dokumentacje, poprawic
+ wszystkie pliki ludo wrzucic do games/ludo
+ dodac ludo do Games
+ profil aktualnie zalogowanego gracza
+ wyglad navbara w trakcie gry
+ wyłącz grę jak ktoś wyjdzie - dialog z ponownym wyszukaniem
+ obsluga rozlaczenia sie gracza
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
+ ekran wyszukiwania z przewidywanym czasem
+ wybór koloru
+ ekran gry
+ wybor pionka
+ przerobienie wygladu profili
+ zaznaczenie aktualnego gracza
+ napraw nowa gre
+ wywalic config z roomState
+ obsluga disconnected:
 + _destroyConnection nie kasuje pokoju, przez co gracz go nie opuszcza
 + obsluzyc update gracza po stronie klienta
 + wyszarzenie pionkow i avatara
 + akcja Disconnected i obsluga na stronie Ludo
 + dodac sprawdzanie actywnych graczy w roll handlerze
 + jezeli wyszla osoba ktora jest aktualnie, ustaw nastepna osobe 
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
+ gdy gracz wyrzuci 6 to moze rzucic jeszcze raz
+ ioConnector -> WebsocketServer
+ ws: authenticate nastepuje przed akcja connect - zawsze mamy dostep do gracza
+ Nie działa nowa gra gdy ktos wygra
+ Nie działa nowa gra gdy ktos sie rozlaczy
+ jesli w trakcie odlaczenia jest kolej gracza odlaczanego gracza to jest bug
+ blad wygranej gracza: akcja finishGame leci dwukrotnie, raz z poprawnym wygranym a raz z drugim
+ actionsStream robiacy dowolne akcje odlozone w czasie
+ stan gracza websocketowego przechowywany w reduxie
+ gdy gracz wejdzie na strone / a potem /ludo to nie leci playerUpdate
+ zakoncz gre jesli jest po czasie
+ _closeRoom zamienic na this.closeRoom
+ test na TimeoutHandler: 1 pole w spawni vs 4 w terenie
+ zmien gracza jesli skonczyla sie jego kolejka:
+ czas gry wysylany ze startGame jako timeLength [ms]
+ zastapic emitNewActions na this.emitRoomActions, dodac concat room actions
+ naprawienie webpack-dev-server
+ rozwiazac npm vulnerabilities
+ Gra: przy profilu aktualnego gracza, progress jego kolejki
+ Gra: koniec rozgrywki gdy sie skonczy czas
+ osobne configi dla frontu i backendu
+ test nowej gry
+ room.handleUpdate: startGame powinno byc zwracana akcja dodana do returnActions
+ room.handleUpdate powinien startowac gre
+ wywalic start gry z findRoom
+ bot powinien byc tworzony z playera
+ przeniesc bot do nowego pliku
+ nie da sie wystartowac rozgrywki dla 2 graczy
+ bot rzuca kostka
+ bot wybiera randomowy ruch i kolor
+ bot rzuca za szybko
+ wywalic room.gameState.actionExpirationTimestamp
+ wywalic configa ze stanu pokoju - musi byc brany na bierzaco z aktualnej gry
+ przetestowac i sprawdzic dodawanie wielu botow: room.updateQueue -> room.addPlayer(freeBots[0]);
+ bot wybiera pionka do ruchu
+ bot wychodzi z pokoju
+ ekran zachety przejscia do fullscreena (gdy user nie jest w fullscreenie - zacheta powtarza sie max 3 razy - localStorage)
+ strona admina: zakladki do przegladania roznych podstron admina
+ serwer do botow!
+ skasowac ui connectora
+ system komunikatow
+ fix pierwszego ekranu na mobilki
+ ciut wieksza plansza horyzontalnie
+ liczenie laga w pokoju gry
+ kostka z nr zostaje dluzej na planszy
+ update reacta ( uzywanie hookow )
+ inne modale w pokoju (styl jak komunikaty)
+ fix skryptu npm run dev
+ naprawa buga pustej akcji
+ zrobic test na buga pustej akcji
+ konczenie gry gdy nie ma aktywnych graczy
+ zmiana komunikatow: Twoja kolej + Gracz x rzucil Y. Wywalic: Waiting for player X
+ zmiana queue timeout na podstronie admina
+ room: mobile styles
+ home: gdy nie ma playera przyciski zablokowane
+ lepsze zaznaczenie pionka
+ bugfix resize'a
+ wspolne Akcje, stale, Utilsy wyniesione do klasy Games
+ wylaczenie fullscreena na ios / modala do fullscreena
+ fix klikania na ios: obsluga touch eventow
+ zmienic akcje fullscreena na https://usefulangle.com/post/105/javascript-change-screen-orientation
+ fix klikania na mobilce (wiekszy obszar sprawdzania klika)
+ customowe kostki
+ podstrona admina z ustawieniem max graczy i max bot timeout
+ zamiana w room, ws: botSelectColorTimeout -> autoSelectColorTimeout
+ za plansza mesh z canvasem, z narysowanym gradientem
+ fix testow
+ roomState -> gameState
+ hotfix obrotu na iphonie
+ do klikania wykorzystac wieksza boundingSphere zamiast 5 zrodel kliku
+ background w osobnym pliku (z board.js)
+ utworzenie pawn.selectionObject czeka az zaladuja sie fonty
+ gracz wyrzuca 6 i nie moze rzucic jeszcze raz
+ dummy websocketServer test
+ pawnController added rotate method. objects are added to Group, not Scene
+ kolory do wyboru (w tym kilka zablokowanych)
+ po obrocie pionki sie zle wyswietlaja
+ brakuje strzalki z zaznaczeniem
+ brakuje zaznaczenia shaderem
+ lepsze dopasowanie kamery
+ polaczyc $portrait i $small-screen
+ bugfixy kostki