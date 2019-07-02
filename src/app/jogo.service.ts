import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, tap, filter } from 'rxjs/operators';
import { Jogo } from './jogo';
import { CategoriaService } from './categoria.service';
import { Categoria } from './categoria';

@Injectable({
  providedIn: 'root'
})
export class JogoService {

  readonly url = 'http://localhost:3000/jogos';
  private jogoSubject$: BehaviorSubject<Jogo[]> = new BehaviorSubject<Jogo[]>(null);
  private loaded: boolean = false;

  constructor(
    private http: HttpClient,
    private categoriaService: CategoriaService) { }

  get(): Observable<Jogo[]> {
    if (!this.loaded) {
      combineLatest(
        this.http.get<Jogo[]>(this.url),
        this.categoriaService.get()
      )
        .pipe(
          tap(([jogos, categorias]) => console.log(jogos, categorias)),
          filter(([jogos, categorias]) => jogos != null && categorias != null),
          map(([jogos, categorias]) => {
            for (let j of jogos) {
              let ids = (j.categorias as string[]);
              j.categorias = ids.map((id) => categorias.find(categ => categ._id == id));
            }
            return jogos;
          }),
          tap((jogos) => console.log(jogos))
        )
        .subscribe(this.jogoSubject$);

      this.loaded = true;
    }
    return this.jogoSubject$.asObservable();
  }

  add(jog: Jogo): Observable<Jogo> {
    let categorias = (jog.categorias as Categoria[]).map(c => c._id);
    return this.http.post<Jogo>(this.url, { ...jog, categorias })
      .pipe(
        tap((j) => {
          this.jogoSubject$.getValue()
            .push({ ...jog, _id: j._id })
        })
      )
  }

  update(jog: Jogo): Observable<Jogo> {
    let categorias = (jog.categorias as Categoria[]).map(c => c._id);
    return this.http.patch<Jogo>(`${this.url}/${jog._id}`, { ...jog, categorias })
      .pipe(
        tap(() => {
          let jogos = this.jogoSubject$.getValue();
          let i = jogos.findIndex(j => j._id === jog._id);
          if (i >= 0)
            jogos[i] = jog;
        })
      )
  }

  del(jog: Jogo): Observable<any> {
    return this.http.delete(`${this.url}/${jog._id}`)
      .pipe(
        tap(() => {
          let jogos = this.jogoSubject$.getValue();
          let i = jogos.findIndex(j => j._id === jog._id);
          if (i >= 0)
            jogos.splice(i, 1);
        })
      )
  }

}