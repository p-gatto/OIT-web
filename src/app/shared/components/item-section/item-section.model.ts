import { CardType } from "../item-card/card-type.model";

export interface ItemSection {
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    cardType: CardType;
    buttonText: string;
    buttonIcon: string;
}