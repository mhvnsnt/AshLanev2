VAR player_name = "player"
VAR met_static = false

-> start

== start ==
Yo, {player_name}. You heard what happened on the bus? # speaker:STATIC
* [Nah, what happened?] -> bus
* [Don't care. We fightin' or what?] -> fight

== bus ==
Man took my kindness for weakness. I don't start it, but I FINISH it. That's the JCPW way — what happens in that locker room stays there. # speaker:STATIC
~ met_static = true
* [F*ck AWE and their leaking.] -> awe
* [Let's just fight.] -> fight

== awe ==
EXACTLY. All that p*ssy-ass fighting over there and they let it leak. Over here? You never heard about my fights 'cause I WON 'em. # speaker:STATIC
-> END

== fight ==
That's what I like to hear. Lace up. And keep your hands up — I throw 'em fast. # speaker:STATIC
-> END
