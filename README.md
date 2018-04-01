TO DO, PLAN GRY

ruch:
gracz rzuca kostka -> serwer losuje liczbe
	- sprawdz czy ruch mozliwy
	- jesli tak to czekaj 8s na wykonanie ruchu
	- jesli nie to zmien gracza
gracz wykonuje ruch ->
	- sprawdz czy ruch mozliwy
	- jesli tak to czekaj wykonaj ruch i zmien gracza
	- jesli nie to odeslij do konsoli ze ruch niemozliwy

-checkMove([pawn], diceNumber) // return [boolean]
-makeMove(pawn, diceNumber) // return fieldSequence



0) Informacje które są zawsze na ekranie (UI):
+profil aktualnie zalogowanego gracza
+wyglad navbara w trakcie gry
+wyłącz grę jak ktoś wyjdzie - dialog z ponownym wyszukaniem
+obsluga rozlaczenia sie gracza

1) Gra
+ przekazywanie ustawien graczy do gry
- wyciagnac wspolna funkcje do liczenia ciagu pozycji pionka
- animacja wejscia pionkow

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
