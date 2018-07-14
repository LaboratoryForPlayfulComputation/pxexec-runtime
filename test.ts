
import grove from './translation';
import { setTimeout } from 'timers';

grove.initialize();

function f1() {
    grove.ledOn(3);
    setTimeout(f2, 1000);
}

function f2() {
    grove.ledOff(3);
    setTimeout(f1, 1000);
}

f1()
