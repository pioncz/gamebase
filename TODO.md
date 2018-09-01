TO DO, PLAN GRY
- stan disconnected aplikacji
- gdy gracz zostanie rozlaczony: dialog z rozlaczeniem i timeout reconnectu do gry i stan disconnected
- gdy sa 2 pionki obok siebie (gora/dol) to w ten wyzej ciezko jest kliknac
- brak synchro czasowego 2 graczy. gracz z opoznieniem ma wrazenie, ze moze rzucic kostka wczesniej.
- gracz zmienia sie za wczesnie. jest juz zaznaczony, a nie moze jeszcze wykonac ruchu
- refaktor games/ludo/index.js
- optymalizacja builda
- gdy pionek sie rusza, selectionObject sie nie animuje
- selectPawn robi unselectPawn na wszystkich innych pawnach
- dorobic wybor pionka po stronie klienta
- gracz wysyla pawnMove action (playerId, pawnId) na serwer
- serwer zwraca sekwencje ruchow pionka
- skasowac ludo z glownego configa
- konczenie gry gdy uplynie czas rozgrywki
- skasowac z room.gameState.players albo playerColors
- widoczna zmiana gracza (jezeli twoja kolejka, to bardziej widoczna)
- zawsze jakis efekt klikniecia
- timer gry
- timer ruchu gracza
- jakies info jak rzucic kostka

-1. Refaktor: 
-eventy socketowe powinny wysylac roomState tylko przy startGame
-zmienic socketServer na ioConnector
-testy serwera
-testy poszczegolnych gier
-testy silnika
-panel admina - stan polaczen, kolejki, obciazenie serwera

0) Informacje które są zawsze na ekranie (UI):
-badge przy avatarze usera informujacy o stanie polaczenia

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