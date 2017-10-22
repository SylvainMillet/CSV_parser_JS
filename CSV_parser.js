/* *** Parser un cvs => tableau *** */
function csvParserTexte(textCSV,separator,delimitor,comment, completer, strict, debug)
{
	//initialisation des arguments
	var separator = (typeof separator !== 'undefined') ? separator : ';'; // separator CSV (defaut point-virgule).
	var delimitor = (typeof delimitor !== 'undefined') ? delimitor : '"'; //caractere delimitant (defaut").
	var comment = (typeof comment !== 'undefined') ? comment : '#'; //caractere indiquant ligne de commentaire à ignorer(defaut #).
	var completer = (typeof completer !== 'undefined') ? completer : true; //si TRUE, on ajoutera des cellules en fin de ligne de tableau pour avoir meme nbr de colonnes
	var strict = (typeof strict !== 'undefined') ? strict : true; //si FALSE, erreurs du doc ignorées
	var debug = (typeof debug !== 'undefined') ? debug : false; //si TRUE et strict TRUE, en cas d'erreur, on renvoie la ligne en erreur
	
	//text existe?
	var textCSV = (typeof textCSV !== 'undefined') ? textCSV : ''; //texte à parser en csv
	if (textCSV == "")
	{
		if (debug) {
			return 0;
		} else {
			return false;
		}
	}
	//controle arguments
	if ((separator.length>1)||(delimitor.length>1)||(comment.length>1))
	{
		if (debug)
		{
			return 0;
		} else {
			return false;
		}
	}
	//gestion des retours chariots
	var charRetourChariot = String.fromCharCode(13); //retour chariot
	//13-10>13
	textCSV = textCSV.replace(new RegExp("("+charRetourChariot+String.fromCharCode(10)+")","g"),charRetourChariot);
	//10>13
	textCSV = textCSV.replace(new RegExp("("+String.fromCharCode(10)+")","g"),charRetourChariot);
	//deb
	while (textCSV.charAt(0)==charRetourChariot)
	{
		textCSV = textCSV.substring(1);
	}
	//fin
	
	while (textCSV.charAt(textCSV.length-1)==charRetourChariot)
	{
		textCSV = textCSV.substring(0,textCSV.length-1);
	}
	
	var charSpace = String.fromCharCode(32); //espace
	var charTab = String.fromCharCode(9); //tabulation
	var tabTotal = new Array(); //tableau de valeur total
	var tabLigne = new Array(); //tableau de valeur de la ligne
	var index = 0; //index sur le texte
	var indexC = ""; //caractere de l'index
	var indexC2 = ""; //caractere de l'index suivant
	var indexC3 = ""; //caractere de l'index suivant+1
	var csvLength = textCSV.length; //taille du texte
	var valCSV = ""; //valeur de la cellule
	var textZone = false; //dans zone texte délimitée
	var i = 0; //incrementation de boucle
	
	//DEB:lecture
	do
	{
		
		indexC = textCSV.charAt(index);
		indexC2 = textCSV.charAt(index+1);
		indexC3 = textCSV.charAt(index+1);
		
		//caracteres espace/tabultion en debut de cellule et hzt
		if (((indexC==charSpace)||(indexC==charTab))&&(valCSV.length==0)&&(!textZone))
		{
			/*nothnig*/
		}
		//delimitor en debut de cellule
		else if ((indexC==delimitor)&&(valCSV.length==0)&&(indexC2!=delimitor))
		{
			textZone=true;
		}
		//delimitor en milieu de cellule et hzt
		else if ((indexC==delimitor)&&(valCSV.length>0)&&(indexC2!=delimitor)&&(!textZone))
		{
			valCSV+=indexC;
		}
		//delimitor double
		else if ((indexC==delimitor)&&(indexC2==delimitor))
		{
			if (valCSV.length==0)
			{
				jscsv_bcl=true;
				for (i=index+2;jscsv_bcl&&(i<=csvLength);i+=1)
				{
					switch (textCSV.charAt(i))
					{
						case charSpace: break;
						case charTab: break;
						case charRetourChariot:
							index=i-1; jscsv_bcl=false;
							break;
						case separator: 
							index=i-1; jscsv_bcl=false;
							break;
						case "":
							index=i-1; jscsv_bcl=false;
							break;
						case delimitor:
							valCSV+=indexC; index+=2;
							textZone=1-textZone;
							jscsv_bcl=false;
							break;
						default:
							valCSV+=indexC; index+=1;
							jscsv_bcl=false;
							break;
					}
				}
			} else { valCSV+=indexC; index+=1; }
		}
		//delimitor en milieu de cellule in zone text
		else if ((indexC==delimitor)&&(indexC2!=delimitor)&&(valCSV.length>0)&&(textZone))
		{
			var jscsv_bcl=true;
			for (i=index+1;jscsv_bcl;i++)
			{
				switch (textCSV.charAt(i))
				{
					case charSpace: break;
					case charTab: break;
					case charRetourChariot:
						//ajout cellule
						tabLigne.push(valCSV); valCSV="";
						tabTotal.push(tabLigne); tabLigne=new Array();
						textZone=false;
						index=i;
						jscsv_bcl=false;
					break;
					case "":
						//ajout cellule
						tabLigne.push(valCSV); valCSV="";
						tabTotal.push(tabLigne); tabLigne=new Array();
						textZone=false;
						index=i;
						jscsv_bcl=false;
					break;
					case separator:
						//ajout cellule
						tabLigne.push(valCSV); valCSV="";
						textZone=false;
						index=i;
						jscsv_bcl=false;
					break;
					default:
						if (strict)
						{ 
							if (debug)
							{
								return textCSV.substring(0,index).split(new RegExp("["+charRetourChariot+"]+","g")).length;
							}
							else { return false; }
						}
						else {
								valCSV+=indexC;
								jscsv_bcl=false;
							 }
					break;
				}
			}
		}
		//separator hzt
		else if ((indexC==separator)&&(!textZone))
		{
			//ajout cellule
			tabLigne.push(valCSV); valCSV="";
		}
		//caractere retour a la ligne hzt
		else if ((indexC==charRetourChariot)&&(!textZone))
		{
			if ((tabLigne.length!=0)||(valCSV.length!=0))
			{
				//ajout cellule
				tabLigne.push(valCSV); valCSV="";
				tabTotal.push(tabLigne); tabLigne=new Array();
			}
		}
		//charComment en debut de cellule et de ligne
		else if ((indexC==comment)&&(valCSV.length==0)&&(tabLigne.length==0))
		{
			i = textCSV.indexOf(charRetourChariot,index);
			if (i==-1) { index=csvLength; } else { index=i; }
		}
		//fin de fichier hzt
		else if (indexC.length==0)
		{
			if (textZone)
			{
				if (strict)  { 
							if (debug)
							{
								return textCSV.substring(0,index).split(new RegExp("["+charRetourChariot+"]+","g")).length;
							}
							else { return false; }
								}
				else
				{
					//ajout cellule
					tabLigne.push(valCSV); valCSV="";
					tabTotal.push(tabLigne); tabLigne=new Array();
				}
			} else {
				//ajout cellule
				tabLigne.push(valCSV); valCSV="";
				tabTotal.push(tabLigne); tabLigne=new Array();
			}
		}
		//autres caracteres
		else
		{
			valCSV+=indexC;
		}
		
		index+=1;
		
	} while (index <= csvLength);
	//FIN:lecture

	//DEB:completer tableau
	if (completer)
	{
		completer=0;
		for (i=0;i<tabTotal.length;i++)
		{
			completer = Math.max(completer,tabTotal[i].length);
		}
		for (i=0;i<tabTotal.length;i++)
		{
			while (tabTotal[i].length < completer)
			{
				tabTotal[i].push('');
			}
		}
	}
	//FIN:completer tableau
	
	return tabTotal;
	//--
}
