TO DO, PLAN GRY
- podczas robienia akcji powinien byc sprawdzany timestamp pokoju
- konczenie gry gdy uplynie czas rozgrywki
- skasowac z room.gameState.players albo playerColors

room.state = {
  winnerId: null,
  colorsQueue, 
  playerColors,
  playerIds = ['22','s31','1','2'], // queue order
  inQueue: false, //
};
// roomState event
{name: 'pickColors', colors: ['1','2','3','4'], finishTimestamp: Date.now() + 6s + .3s}, //pick colors aoutmaticaly if players dont pick colors. .3s for leave queue animation
room.actions = [
 //after 6.3s
 {name: 'playerPickedColor', playerId: '1', color: '1'},//action change state, finish immediately
 {name: 'playerPickedColor', playerId: '2', color: '2'},
 {name: 'startGame', finishTimestamp: Date.now() + .3s, gameState: {} } // delay this action for start game animation
 //after .3s 
 {name: 'waitForPlayerAction', playerId: '22', finishTimestamp: Date.now() + 4s} // wait for player action
 //up to +4s
 {name: 'playerRolled', playerId: '22', diceValue: 0}
 {name: 'waitForPlayerAction', playerId: 's31', finishTimestamp: Date.now() + 4s} // wait for player action
 //after 4s
 {name: 'waitForPlayerAction', playerId: '1', finishTimestamp: Date.now() + 4s} // wait for player action
 {name: 'playerRolled', playerId: '22', diceValue: 6},
 {name: 'movePawns', pawnSequences=[{pawnId: '3', sequence: []}], finishTimestamp: Date.now() + 1s} // ... emit pawn sequences to move one after one.
 //after 1s (pawn animation length)
 {name: 'waitForPlayerAction', playerId: '4', finishTimestamp: Date.now() + 4s} // wait for player action
 ...
 {name: 'gameFinished', winnerId: 's31'} //after this message room is removed
]

-1. Refaktor: 
- zbudowac dokumentacje, poprawic
- początkowy stan w Room.js powinien byc brany z klasy gry
- wywalic stare metody z serwera
 
-wszystkie pliki ludo wrzucic do games/ludo
-dodac ludo do Games
-zmienic socketServer na ioConnector
-testy serwera
-testy poszczegolnych gier
-testy silnika
-panel admina - stan polaczen, kolejki, obciazenie serwera

0) Informacje które są zawsze na ekranie (UI):
+profil aktualnie zalogowanego gracza
+wyglad navbara w trakcie gry
+wyłącz grę jak ktoś wyjdzie - dialog z ponownym wyszukaniem
+obsluga rozlaczenia sie gracza
-badge przy avatarze usera informujacy o stanie polaczenia

1) Gra
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
- przy profilu aktualnego gracza, progress jego kolejki
- wybor pionka
- gdy ktos w pokoju gracza wyjdzie, a on dolaczy do nowej rozgrywki, to w pickColor modalu nie wybiera zadnego koloru
- gdy ktos w pokoju gracza wyjdzie, a on dolaczy do nowej rozgrywki, to kolory pionkow u graczy sie nie zgadzaja
- koniec rozgrywki gdy sie skonczy czas

2) Strona Ludo
+ekran wyszukiwania z przewidywanym czasem
+wybór koloru
+ekran gry
-przerobienie wygladu profili
-zaznaczenie aktualnego gracza
-wybór (graj sam lub ze znajomymi)

3) Strona główna
-lista gier

4) Czat
-szybki dostep do czatu i listy znajomych z funkcja zaproszenia do gry